import "server-only";
import { prisma } from "@/shared/lib/prisma";
import { DomainError } from "@/shared/lib/action-result";
import { getSection } from "@/modules/cms/service";
import { recordMovement } from "@/modules/points/service";
import { pointsForDonation } from "@/modules/points/rules";
import type { DonationStatus, Prisma } from "@/generated/prisma/client";
import type { CreateDonationInput } from "./schemas";

/** Toda donación apunta a un proyecto: si no se elige, va a la fundación principal. */
async function resolveProjectId(projectId?: string) {
  if (projectId) return projectId;
  const main = await prisma.project.findFirst({ where: { isMain: true, isActive: true }, select: { id: true } });
  return main?.id;
}

const include = {
  profile: { select: { id: true, fullName: true, email: true } },
  project: { select: { id: true, name: true, color: true, slug: true } },
  event: { select: { id: true, title: true } },
  validatedBy: { select: { id: true, fullName: true } },
} satisfies Prisma.DonationInclude;

type Row = Prisma.DonationGetPayload<{ include: typeof include }>;

/** DTO serializable (Decimal → number) para pasar a componentes cliente. */
function toDto(d: Row) {
  return { ...d, amount: Number(d.amount) };
}
export type DonationDto = ReturnType<typeof toDto>;

export async function createDonation(profileId: string, input: CreateDonationInput, receiptPath?: string | null) {
  const { minDonation } = await getSection("gamification");
  if (input.amount < minDonation) throw new DomainError(`La donación mínima registrable es Bs. ${minDonation}.`);
  input = { ...input, projectId: await resolveProjectId(input.projectId) };

  if (input.projectId) {
    const project = await prisma.project.findFirst({ where: { id: input.projectId, isActive: true } });
    if (!project) throw new DomainError("El proyecto seleccionado no existe.");
    if (!project.acceptsDonations) throw new DomainError("Esta campaña ya no recibe donaciones.");
  }
  if (input.eventId) {
    const event = await prisma.event.findFirst({ where: { id: input.eventId, isActive: true } });
    if (!event) throw new DomainError("La actividad seleccionada no existe.");
  }

  return prisma.donation.create({
    data: {
      amount: input.amount,
      method: input.method,
      reference: input.reference,
      note: input.note,
      projectId: input.projectId,
      eventId: input.eventId,
      receiptPath: receiptPath ?? null,
      isAnonymous: input.isAnonymous ?? false,
      isRecurring: input.isRecurring ?? false,
      message: input.message ?? null,
      profileId,
    },
  });
}

/** Moderación de "palabras de apoyo". */
export async function setMessageHidden(id: string, hidden: boolean) {
  const d = await prisma.donation.findUnique({ where: { id }, select: { message: true } });
  if (!d?.message) throw new DomainError("Esta donación no tiene mensaje.");
  await prisma.donation.update({ where: { id }, data: { messageHidden: hidden } });
}

export async function listSupportMessages() {
  const rows = await prisma.donation.findMany({
    where: { message: { not: null } },
    include,
    orderBy: { createdAt: "desc" },
    take: 300,
  });
  return rows.map(toDto);
}

/** Resumen del donante para su panel (como "Mi Panel" de la app anterior). */
export async function donorSummary(profileId: string) {
  const [all, approved, projects] = await Promise.all([
    prisma.donation.count({ where: { profileId } }),
    prisma.donation.aggregate({ where: { profileId, status: "APPROVED" }, _sum: { amount: true } }),
    prisma.donation.groupBy({ by: ["projectId"], where: { profileId, status: "APPROVED", projectId: { not: null } } }),
  ]);
  return {
    donationsCount: all,
    totalDonated: Number(approved._sum.amount ?? 0),
    supportedProjectIds: projects.map((p) => p.projectId!),
  };
}

export async function listDonations(filter: { profileId?: string; status?: DonationStatus; take?: number } = {}) {
  const rows = await prisma.donation.findMany({
    where: { profileId: filter.profileId, status: filter.status },
    include,
    orderBy: { createdAt: "desc" },
    take: filter.take ?? 200,
  });
  return rows.map(toDto);
}

export async function getDonation(id: string) {
  const row = await prisma.donation.findUnique({ where: { id }, include });
  return row ? toDto(row) : null;
}

/** Aprueba una donación pendiente y acredita los puntos al donante. */
export async function approveDonation(id: string, validatorId: string) {
  const { pointsPerBoliviano } = await getSection("gamification");

  return prisma.$transaction(async (tx) => {
    const donation = await tx.donation.findUnique({ where: { id } });
    if (!donation) throw new DomainError("Donación no encontrada.");

    const points = donation.profileId ? pointsForDonation(Number(donation.amount), pointsPerBoliviano) : 0;

    // Cambio de estado condicional: evita aprobar dos veces en paralelo.
    const { count } = await tx.donation.updateMany({
      where: { id, status: "PENDING" },
      data: { status: "APPROVED", validatedById: validatorId, validatedAt: new Date(), pointsAwarded: points },
    });
    if (count === 0) throw new DomainError("La donación ya fue procesada.");

    if (donation.profileId && points > 0) {
      await recordMovement(tx, {
        profileId: donation.profileId,
        amount: points,
        reason: "DONATION",
        description: `Donación de Bs. ${Number(donation.amount)}`,
        referenceId: donation.id,
        createdById: validatorId,
      });
    }
    return points;
  });
}

export async function rejectDonation(id: string, validatorId: string, reason?: string) {
  const { count } = await prisma.donation.updateMany({
    where: { id, status: "PENDING" },
    data: { status: "REJECTED", validatedById: validatorId, validatedAt: new Date(), rejectionReason: reason || null },
  });
  if (count === 0) throw new DomainError("La donación ya fue procesada.");
}

/** Registro manual de una donación recibida (efectivo, depósito, etc.). */
export async function recordOfflineDonation(
  adminId: string,
  input: CreateDonationInput & { donorName?: string; profileId?: string },
) {
  input = { ...input, projectId: await resolveProjectId(input.projectId) };
  const donation = await prisma.donation.create({
    data: {
      amount: input.amount,
      method: input.method,
      reference: input.reference,
      note: input.note,
      projectId: input.projectId,
      eventId: input.eventId,
      donorName: input.donorName,
      profileId: input.profileId,
    },
  });
  await approveDonation(donation.id, adminId);
  return donation;
}

export async function donationStats() {
  const [approved, pending, donors, byProject] = await Promise.all([
    prisma.donation.aggregate({ where: { status: "APPROVED" }, _sum: { amount: true }, _count: true }),
    prisma.donation.count({ where: { status: "PENDING" } }),
    prisma.donation.groupBy({ by: ["profileId"], where: { status: "APPROVED", profileId: { not: null } } }),
    prisma.donation.groupBy({ by: ["projectId"], where: { status: "APPROVED" }, _sum: { amount: true } }),
  ]);
  const recurring = await prisma.donation.groupBy({
    by: ["profileId"],
    where: { isRecurring: true, status: { not: "REJECTED" }, profileId: { not: null } },
  });
  return {
    totalRaised: Number(approved._sum.amount ?? 0),
    approvedCount: approved._count,
    pendingCount: pending,
    donorsCount: donors.length,
    recurringDonorsCount: recurring.length,
    raisedByProject: Object.fromEntries(byProject.map((r) => [r.projectId ?? "general", Number(r._sum.amount ?? 0)])),
  };
}

/** Recaudación mensual de los últimos `months` meses (para gráficos). */
export async function monthlyTotals(months = 6) {
  const since = new Date();
  since.setMonth(since.getMonth() - (months - 1), 1);
  since.setHours(0, 0, 0, 0);
  const rows = await prisma.donation.findMany({
    where: { status: "APPROVED", createdAt: { gte: since } },
    select: { amount: true, createdAt: true },
  });
  const buckets = new Map<string, number>();
  for (let i = 0; i < months; i++) {
    const d = new Date(since);
    d.setMonth(since.getMonth() + i);
    buckets.set(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, 0);
  }
  for (const r of rows) {
    const k = `${r.createdAt.getFullYear()}-${String(r.createdAt.getMonth() + 1).padStart(2, "0")}`;
    if (buckets.has(k)) buckets.set(k, (buckets.get(k) ?? 0) + Number(r.amount));
  }
  return [...buckets.entries()].map(([month, total]) => ({ month, total }));
}
