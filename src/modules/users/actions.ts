"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { assertRole } from "@/modules/auth/session";
import { adjustPoints } from "@/modules/points/service";
import { toActionError, type ActionResult } from "@/shared/lib/action-result";
import { formObject } from "@/modules/panel/form-data";
import { adjustPointsSchema, adminUserUpdateSchema, createUserSchema, profileUpdateSchema } from "./schemas";
import { createUser, updateOwnProfile, updateUserAccess } from "./service";

export async function updateProfileAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    const user = await assertRole();
    await updateOwnProfile(user.id, profileUpdateSchema.parse(formObject(formData)));
    revalidatePath("/panel", "layout");
    return { ok: true, message: "Perfil actualizado." };
  } catch (e) {
    return toActionError(e);
  }
}

export async function updateUserAccessAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    const admin = await assertRole("ADMIN");
    const { id, role, isActive } = adminUserUpdateSchema.parse(formObject(formData));
    await updateUserAccess(admin.id, id, role, isActive);
    revalidatePath("/panel", "layout");
    return { ok: true, message: "Acceso actualizado." };
  } catch (e) {
    return toActionError(e);
  }
}

export async function adjustPointsAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    const admin = await assertRole("ADMIN");
    const { id, amount, description } = adjustPointsSchema.parse(formObject(formData));
    await adjustPoints(id, amount, description, admin.id);
    revalidatePath("/panel", "layout");
    return { ok: true, message: "Puntos ajustados." };
  } catch (e) {
    return toActionError(e);
  }
}

export async function createUserAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    await assertRole("ADMIN");
    await createUser(createUserSchema.parse(formObject(formData)));
    revalidatePath("/panel", "layout");
    return { ok: true, message: "Usuario creado. Ya puede iniciar sesión." };
  } catch (e) {
    return toActionError(e);
  }
}

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(/[A-Za-z]/, "Debe incluir letras")
      .regex(/[0-9]/, "Debe incluir números"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, { path: ["confirmPassword"], message: "Las contraseñas no coinciden" });

export async function changePasswordAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    await assertRole();
    const { password } = passwordSchema.parse(formObject(formData));
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { ok: false, error: "No se pudo cambiar la contraseña. Prueba con otra distinta a la actual." };
    return { ok: true, message: "Contraseña actualizada." };
  } catch (e) {
    return toActionError(e);
  }
}
