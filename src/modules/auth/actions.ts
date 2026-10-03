"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/shared/lib/prisma";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { toActionError, type ActionResult } from "@/shared/lib/action-result";
import { loginSchema, registerSchema } from "./schemas";

function safeNext(next: FormDataEntryValue | null) {
  const value = typeof next === "string" ? next : "";
  return value.startsWith("/") && !value.startsWith("//") ? value : "/panel";
}

export async function loginAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return toActionError(parsed.error);

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) return { ok: false, error: "Correo o contraseña incorrectos." };

  const profile = await prisma.profile.findUnique({
    where: { id: data.user.id },
    select: { isActive: true },
  });
  if (profile && !profile.isActive) {
    await supabase.auth.signOut();
    return { ok: false, error: "Tu cuenta está desactivada. Contacta a la fundación." };
  }

  redirect(safeNext(formData.get("next")));
}

export async function registerAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return toActionError(parsed.error);
  const { email, password, fullName, phone } = parsed.data;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, phone } },
  });

  if (error) {
    const msg = /already|registered|exists/i.test(error.message)
      ? "Ya existe una cuenta con este correo."
      : "No pudimos crear tu cuenta. Inténtalo de nuevo.";
    return { ok: false, error: msg };
  }
  if (!data.user) return { ok: false, error: "No pudimos crear tu cuenta." };

  await prisma.profile.upsert({
    where: { id: data.user.id },
    update: { fullName, phone },
    create: { id: data.user.id, email, fullName, phone },
  });

  // Si el proyecto exige confirmar el correo, no hay sesión todavía.
  if (!data.session) {
    return { ok: true, message: "Te enviamos un correo para confirmar tu cuenta." };
  }
  redirect(safeNext(formData.get("next")));
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
