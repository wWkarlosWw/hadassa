import "server-only";
import { prisma } from "@/shared/lib/prisma";
import { DomainError } from "@/shared/lib/action-result";
import { recordMovement } from "@/modules/points/service";
import type { Role } from "@/generated/prisma/client";
import type { EventInput } from "./schemas";

const activeParticipation = { status: { not: "CANCELLED" as const } };

export async function listUpcomingEvents(take = 20, projectId?: string) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return prisma.event.findMany({
    where: { isActive: true, startsAt: { gte: startOfToday }, projectId },
    include: {
      project: { select: { name: true, color: true } },
      _count: { select: { participations: { where: activeParticipation } } },
    },
    orderBy: { startsAt: "asc" },
    take,
  });
}

export async function listAllEvents() {
  return prisma.event.findMany({
    include: {
      project: { select: { id: true, name: true, color: true } },
      supervisors: { include: { profile: { select: { id: true, fullName: true, email: true } } } },
      _count: { select: { participations: { where: activeParticipation } } },
    },
    orderBy: { startsAt: "desc" },
  });
}

export async function saveEvent(input: EventInput) {
  const { id, ...data } = input;
  const payload = { ...data, projectId: data.projectId ?? null, imageUrl: data.imageUrl || null };
  return id ? prisma.event.update({ where: { id }, data: payload }) : prisma.event.create({ data: payload });
}

export async function deleteEvent(id: string) {
  const hasHistory = await prisma.eventParticipation.count({ where: { eventId: id, status: "ATTENDED" } });
  if (hasHistory > 0) {
    // Conserva el historial de asistencia: solo se desactiva.
    await prisma.event.update({ where: { id }, data: { isActive: false } });
    return "deactivated" as const;
  }
  await prisma.event.delete({ where: { id } });
  return "deleted" as const;
}

// ─── Inscripciones ──────────────────────────────────────────────────────────

export async function listMyParticipations(profileId: string) {
  return prisma.eventParticipation.findMany({
    where: { profileId },
    include: { event: { select: { id: true, title: true, startsAt: true, location: true, pointsReward: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function registerToEvent(profileId: string, eventId: string) {
  return prisma.$transaction(async (tx) => {
    const event = await tx.event.findFirst({ where: { id: eventId, isActive: true } });
    if (!event) throw new DomainError("La actividad no está disponible.");
    if (event.startsAt < new Date(Date.now() - 24 * 3600 * 1000)) throw new DomainError("La actividad ya pasó.");

    if (event.capacity) {
      const taken = await tx.eventParticipation.count({ where: { eventId, ...activeParticipation } });
      if (taken >= event.capacity) throw new DomainError("Ya no hay cupos disponibles.");
    }

    const existing = await tx.eventParticipation.findUnique({ where: { profileId_eventId: { profileId, eventId } } });
    if (existing?.status === "REGISTERED" || existing?.status === "ATTENDED") {
      throw new DomainError("Ya estás inscrito en esta actividad.");
    }
    if (existing) {
      return tx.eventParticipation.update({ where: { id: existing.id }, data: { status: "REGISTERED" } });
    }
    return tx.eventParticipation.create({ data: { profileId, eventId } });
  });
}

export async function cancelParticipation(participationId: string, actor: { id: string; role: Role }) {
  const p = await prisma.eventParticipation.findUnique({ where: { id: participationId } });
  if (!p) throw new DomainError("Inscripción no encontrada.");
  if (actor.role === "USER" && p.profileId !== actor.id) throw new DomainError("No autorizado.");
  if (p.status !== "REGISTERED") throw new DomainError("Esta inscripción ya no se puede cancelar.");
  await prisma.eventParticipation.update({ where: { id: participationId }, data: { status: "CANCELLED" } });
}

// ─── Supervisión y asistencia ───────────────────────────────────────────────

/** Eventos que un usuario puede validar (admin: todos; supervisor: asignados). */
export async function listValidatableEvents(actor: { id: string; role: Role }) {
  return prisma.event.findMany({
    where: actor.role === "ADMIN" ? {} : { supervisors: { some: { profileId: actor.id } } },
    include: {
      participations: {
        where: activeParticipation,
        include: { profile: { select: { id: true, fullName: true, email: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { startsAt: "desc" },
  });
}

export async function markAttendance(participationId: string, validator: { id: string; role: Role }) {
  return prisma.$transaction(async (tx) => {
    const p = await tx.eventParticipation.findUnique({ where: { id: participationId }, include: { event: true } });
    if (!p) throw new DomainError("Inscripción no encontrada.");

    if (validator.role !== "ADMIN") {
      const assigned = await tx.eventSupervisor.findUnique({
        where: { profileId_eventId: { profileId: validator.id, eventId: p.eventId } },
      });
      if (!assigned) throw new DomainError("No estás asignado como supervisor de esta actividad.");
    }

    const { count } = await tx.eventParticipation.updateMany({
      where: { id: participationId, status: "REGISTERED" },
      data: { status: "ATTENDED", validatedById: validator.id, validatedAt: new Date() },
    });
    if (count === 0) throw new DomainError("La asistencia ya fue registrada.");

    await recordMovement(tx, {
      profileId: p.profileId,
      amount: p.event.pointsReward,
      reason: "ATTENDANCE",
      description: `Asistencia: ${p.event.title}`,
      referenceId: p.id,
      createdById: validator.id,
    });
    return p.event.pointsReward;
  });
}

export async function assignSupervisor(profileId: string, eventId: string) {
  const profile = await prisma.profile.findUnique({ where: { id: profileId } });
  if (!profile || (profile.role !== "SUPERVISOR" && profile.role !== "ADMIN")) {
    throw new DomainError("El usuario debe tener rol de supervisor.");
  }
  const exists = await prisma.eventSupervisor.findUnique({ where: { profileId_eventId: { profileId, eventId } } });
  if (exists) throw new DomainError("Ya está asignado a esta actividad.");
  return prisma.eventSupervisor.create({ data: { profileId, eventId } });
}

export const removeSupervisor = (id: string) => prisma.eventSupervisor.delete({ where: { id } });
