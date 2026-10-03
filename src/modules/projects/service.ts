import "server-only";
import { cache } from "react";
import { prisma } from "@/shared/lib/prisma";
import { DomainError } from "@/shared/lib/action-result";
import { slugify } from "@/shared/lib/utils";
import type { Project } from "@/generated/prisma/client";
import { donorDisplayName, filterCampaigns, sortCampaigns, type CampaignSort } from "./campaign";
import type { ProjectInput, ProjectUpdateInput } from "./schemas";

interface Stats {
  raised: number;
  donationsCount: number;
}

function toDto(p: Project, stats: Stats = { raised: 0, donationsCount: 0 }) {
  return { ...p, goal: p.goal === null ? null : Number(p.goal), raised: stats.raised, donationsCount: stats.donationsCount };
}
export type ProjectDto = ReturnType<typeof toDto>;

const projectOrder = [{ isMain: "desc" as const }, { sortOrder: "asc" as const }, { name: "asc" as const }];

/**
 * Recaudado y nº de donaciones por proyecto. Solo cuentan las APROBADAS.
 * Las donaciones sin proyecto (históricas o registradas a mano) suman a la
 * fundación principal.
 */
async function statsByProject() {
  const [rows, main] = await Promise.all([
    prisma.donation.groupBy({
      by: ["projectId"],
      where: { status: "APPROVED" },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.project.findFirst({ where: { isMain: true }, select: { id: true } }),
  ]);
  const map = new Map<string, Stats>();
  for (const r of rows) {
    const key = r.projectId ?? main?.id;
    if (!key) continue;
    const prev = map.get(key) ?? { raised: 0, donationsCount: 0 };
    map.set(key, { raised: prev.raised + Number(r._sum.amount ?? 0), donationsCount: prev.donationsCount + r._count._all });
  }
  return map;
}

export const listPublicProjects = cache(async () => {
  const [projects, stats] = await Promise.all([
    prisma.project.findMany({ where: { isActive: true }, orderBy: projectOrder }),
    statsByProject(),
  ]);
  return projects.map((p) => toDto(p, stats.get(p.id)));
});

/** Fundación principal ("donde más se necesite"). */
export const getMainProject = cache(async () => {
  const all = await listPublicProjects();
  return all.find((p) => p.isMain) ?? null;
});

/** Id de la fundación principal (para donaciones sin proyecto elegido). */
export async function mainProjectId() {
  const main = await prisma.project.findFirst({ where: { isMain: true, isActive: true }, select: { id: true } });
  return main?.id ?? null;
}

export const getProjectBySlug = cache(async (slug: string) => {
  const project = await prisma.project.findFirst({ where: { slug, isActive: true } });
  if (!project) return null;
  const stats = await statsByProject();
  return toDto(project, stats.get(project.id));
});

// ─── Campañas (explorador estilo crowdfunding) ──────────────────────────────

/** Proyectos-campaña (sin la fundación principal, que se muestra aparte). */
export async function listCampaigns(opts: { q?: string; category?: string; sort?: CampaignSort } = {}) {
  const all = (await listPublicProjects()).filter((p) => !p.isMain);
  return sortCampaigns(filterCampaigns(all, opts), opts.sort ?? "destacadas");
}

export async function listCampaignCategories() {
  const all = (await listPublicProjects()).filter((p) => !p.isMain);
  return [...new Set(all.map((p) => p.category).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

/** Detalle público: donaciones recientes, palabras de apoyo, novedades y top donantes. */
export const getCampaign = cache(async (slug: string) => {
  const project = await getProjectBySlug(slug);
  if (!project) return null;

  // La fundación principal también recibe las donaciones sin proyecto.
  const approved = project.isMain
    ? { status: "APPROVED" as const, OR: [{ projectId: project.id }, { projectId: null }] }
    : { projectId: project.id, status: "APPROVED" as const };
  const donorSelect = {
    id: true,
    amount: true,
    createdAt: true,
    isAnonymous: true,
    donorName: true,
    message: true,
    profile: { select: { fullName: true } },
  } as const;

  const [recent, messages, updates, top] = await Promise.all([
    prisma.donation.findMany({ where: approved, select: donorSelect, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.donation.findMany({
      where: { ...approved, message: { not: null }, messageHidden: false },
      select: donorSelect,
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    prisma.projectUpdate.findMany({ where: { projectId: project.id }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.donation.groupBy({
      by: ["profileId"],
      where: { ...approved, isAnonymous: false, profileId: { not: null } },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 3,
    }),
  ]);

  const topProfiles = await prisma.profile.findMany({
    where: { id: { in: top.map((t) => t.profileId!) } },
    select: { id: true, fullName: true },
  });
  const nameOf = new Map(topProfiles.map((p) => [p.id, p.fullName]));

  const toPublic = (d: (typeof recent)[number]) => ({
    id: d.id,
    amount: Number(d.amount),
    createdAt: d.createdAt,
    name: donorDisplayName({ isAnonymous: d.isAnonymous, fullName: d.profile?.fullName, donorName: d.donorName }),
    message: d.message,
  });

  return {
    project,
    recentDonations: recent.map(toPublic),
    supportMessages: messages.filter((m) => m.message?.trim()).map(toPublic),
    updates,
    topDonors: top.map((t) => ({
      name: donorDisplayName({ isAnonymous: false, fullName: nameOf.get(t.profileId!) }),
      amount: Number(t._sum.amount ?? 0),
    })),
  };
});

export async function listAllProjects() {
  const [projects, stats] = await Promise.all([
    prisma.project.findMany({
      orderBy: projectOrder,
      include: { _count: { select: { donations: true, events: true, updates: true } } },
    }),
    statsByProject(),
  ]);
  return projects.map(({ _count, ...p }) => ({ ...toDto(p, stats.get(p.id)), _count }));
}

export async function getProjectById(id: string) {
  const p = await prisma.project.findUnique({ where: { id } });
  return p ? toDto(p) : null;
}

/** Campañas con más recaudación (para el dashboard de admin). */
export async function topCampaigns(take = 5) {
  const all = await listPublicProjects();
  return sortCampaigns(all, "mas-recaudado").slice(0, take);
}

export async function saveProject(input: ProjectInput) {
  const { id, slug, ...data } = input;
  const finalSlug = slugify(slug || data.name);
  if (!finalSlug) throw new DomainError("No se pudo generar el identificador del proyecto.");

  const clash = await prisma.project.findFirst({ where: { slug: finalSlug, NOT: id ? { id } : undefined } });
  if (clash) throw new DomainError("Ya existe un proyecto con ese identificador.");

  const current = id ? await prisma.project.findUnique({ where: { id }, select: { isMain: true } }) : null;
  if ((current?.isMain || data.isMain) && !data.isActive) {
    throw new DomainError("La fundación principal no puede ocultarse. Marca otro proyecto como principal primero.");
  }
  if (current?.isMain && !data.isMain) {
    throw new DomainError("Debe existir una fundación principal: marca otro proyecto como principal en lugar de quitar esta.");
  }

  const payload = { ...data, slug: finalSlug, logoUrl: data.logoUrl || null, coverUrl: data.coverUrl || null };
  return prisma.$transaction(async (tx) => {
    // Solo una fundación principal a la vez.
    if (data.isMain) await tx.project.updateMany({ where: { isMain: true, NOT: id ? { id } : undefined }, data: { isMain: false } });
    return id ? tx.project.update({ where: { id }, data: payload }) : tx.project.create({ data: payload });
  });
}

export async function deleteProject(id: string) {
  const project = await prisma.project.findUnique({ where: { id }, select: { isMain: true } });
  if (project?.isMain) throw new DomainError("La fundación principal no se puede eliminar.");
  const donations = await prisma.donation.count({ where: { projectId: id } });
  if (donations > 0) {
    await prisma.project.update({ where: { id }, data: { isActive: false } });
    return "deactivated" as const;
  }
  await prisma.project.delete({ where: { id } });
  return "deleted" as const;
}

// ─── Novedades ──────────────────────────────────────────────────────────────

export const listProjectUpdates = (projectId: string) =>
  prisma.projectUpdate.findMany({
    where: { projectId },
    include: { author: { select: { fullName: true } } },
    orderBy: { createdAt: "desc" },
  });

export async function saveProjectUpdate(input: ProjectUpdateInput, authorId: string) {
  const { id, projectId, ...data } = input;
  const payload = { ...data, imageUrl: data.imageUrl || null };
  if (id) {
    const existing = await prisma.projectUpdate.findUnique({ where: { id } });
    if (!existing || existing.projectId !== projectId) throw new DomainError("Novedad no encontrada.");
    return prisma.projectUpdate.update({ where: { id }, data: payload });
  }
  return prisma.projectUpdate.create({ data: { ...payload, projectId, authorId } });
}

export const deleteProjectUpdate = (id: string) => prisma.projectUpdate.delete({ where: { id } });
