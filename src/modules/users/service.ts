import "server-only";
import { prisma } from "@/shared/lib/prisma";
import { DomainError } from "@/shared/lib/action-result";
import { createSupabaseAdminClient } from "@/shared/lib/supabase/admin";
import type { Role } from "@/generated/prisma/client";
import type { ProfileUpdateInput } from "./schemas";

export const getProfile = (id: string) => prisma.profile.findUnique({ where: { id } });

export async function updateOwnProfile(id: string, input: ProfileUpdateInput) {
  if (input.ci) {
    const clash = await prisma.profile.findFirst({ where: { ci: input.ci, NOT: { id } } });
    if (clash) throw new DomainError("Ese carnet ya está registrado.");
  }
  return prisma.profile.update({ where: { id }, data: input });
}

export async function listUsers(params: { q?: string; role?: Role } = {}) {
  const q = params.q?.trim();
  return prisma.profile.findMany({
    where: {
      role: params.role,
      OR: q
        ? [
            { fullName: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { ci: { contains: q } },
          ]
        : undefined,
    },
    orderBy: { createdAt: "desc" },
    take: 300,
  });
}

export const listStaff = () =>
  prisma.profile.findMany({
    where: { role: { in: ["SUPERVISOR", "ADMIN"] }, isActive: true },
    select: { id: true, fullName: true, email: true, role: true },
    orderBy: { fullName: "asc" },
  });

export async function updateUserAccess(actorId: string, id: string, role: Role, isActive: boolean) {
  if (actorId === id && (role !== "ADMIN" || !isActive)) {
    throw new DomainError("No puedes quitarte el rol de administrador ni desactivar tu propia cuenta.");
  }
  return prisma.profile.update({ where: { id }, data: { role, isActive } });
}

/** Crea un usuario en Supabase Auth + su perfil (desde el panel de admin). */
export async function createUser(input: { fullName: string; email: string; phone: string | null; role: Role; password: string }) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: { full_name: input.fullName, phone: input.phone },
  });
  if (error || !data.user) {
    throw new DomainError(/already/i.test(error?.message ?? "") ? "Ya existe un usuario con ese correo." : "No se pudo crear el usuario.");
  }
  return prisma.profile.upsert({
    where: { id: data.user.id },
    update: { fullName: input.fullName, phone: input.phone, role: input.role },
    create: { id: data.user.id, email: input.email, fullName: input.fullName, phone: input.phone, role: input.role },
  });
}

export async function userStats() {
  const [total, byRole, newThisMonth] = await Promise.all([
    prisma.profile.count(),
    prisma.profile.groupBy({ by: ["role"], _count: true }),
    prisma.profile.count({
      where: { createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
    }),
  ]);
  return { total, newThisMonth, byRole: Object.fromEntries(byRole.map((r) => [r.role, r._count])) as Partial<Record<Role, number>> };
}

export const findProfileByEmail = (email: string) =>
  prisma.profile.findUnique({ where: { email: email.toLowerCase() }, select: { id: true, fullName: true, email: true } });
