import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/shared/lib/prisma";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import type { Profile, Role } from "@/generated/prisma/client";

export type SessionUser = Pick<
  Profile,
  "id" | "email" | "fullName" | "role" | "points" | "avatarUrl" | "isActive"
>;

/**
 * Usuario autenticado actual (o null). Verifica el JWT con Supabase y carga el
 * perfil desde Postgres. Se memoiza por request con `cache`.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;

  const select = {
    id: true,
    email: true,
    fullName: true,
    role: true,
    points: true,
    avatarUrl: true,
    isActive: true,
  } as const;

  const profile = await prisma.profile.findUnique({ where: { id: claims.sub }, select });
  if (profile) return profile;

  // Usuario de Auth sin perfil (p. ej. creado desde el dashboard de Supabase).
  const meta = (claims.user_metadata ?? {}) as Record<string, unknown>;
  const email = String(claims.email ?? "");
  return prisma.profile.upsert({
    where: { id: claims.sub },
    update: {},
    create: {
      id: claims.sub,
      email,
      fullName: String(meta.full_name ?? email.split("@")[0] ?? "Usuario"),
      phone: meta.phone ? String(meta.phone) : null,
    },
    select,
  });
});

/** Exige sesión activa; si no, redirige al login. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/ingresar");
  if (!user.isActive) redirect("/auth/salir?motivo=inactivo");
  return user;
}

/** Exige uno de los roles indicados; si no, vuelve al panel. */
export async function requireRole(...roles: Role[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect("/panel");
  return user;
}

/** Variante para Server Actions: lanza en vez de redirigir. */
export async function assertRole(...roles: Role[]): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user || !user.isActive) throw new Error("No autenticado");
  if (roles.length && !roles.includes(user.role)) throw new Error("No autorizado");
  return user;
}

export const isStaff = (role: Role) => role === "ADMIN" || role === "SUPERVISOR";
