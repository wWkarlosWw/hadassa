"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertRole } from "@/modules/auth/session";
import { findProfileByEmail } from "@/modules/users/service";
import { fileFrom, uploadReceipt } from "@/shared/lib/storage";
import { DomainError, toActionError, type ActionResult } from "@/shared/lib/action-result";
import { formObject } from "@/modules/panel/form-data";
import { formatNumber } from "@/shared/lib/utils";
import { createDonationSchema, messageVisibilitySchema, rejectDonationSchema } from "./schemas";
import { approveDonation, createDonation, recordOfflineDonation, rejectDonation, setMessageHidden } from "./service";

function revalidate() {
  revalidatePath("/panel", "layout");
}

export async function createDonationAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    const user = await assertRole();
    const input = createDonationSchema.parse(formObject(formData));
    const receipt = fileFrom(formData, "receipt");
    const receiptPath = receipt ? await uploadReceipt(receipt, user.id) : null;
    await createDonation(user.id, input, receiptPath);
    revalidate();
    return {
      ok: true,
      message: "¡Gracias! Registramos tu donación. Sumarás tus puntos cuando el equipo la valide.",
    };
  } catch (e) {
    return toActionError(e);
  }
}

export async function approveDonationAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    const user = await assertRole("SUPERVISOR", "ADMIN");
    const id = z.uuid().parse(formData.get("id"));
    const points = await approveDonation(id, user.id);
    revalidate();
    revalidatePath("/", "layout");
    return { ok: true, message: points > 0 ? `Donación aprobada: +${formatNumber(points)} puntos al donante.` : "Donación aprobada." };
  } catch (e) {
    return toActionError(e);
  }
}

export async function rejectDonationAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    const user = await assertRole("SUPERVISOR", "ADMIN");
    const { id, reason } = rejectDonationSchema.parse(formObject(formData));
    await rejectDonation(id, user.id, reason);
    revalidate();
    return { ok: true, message: "Donación rechazada." };
  } catch (e) {
    return toActionError(e);
  }
}

const offlineSchema = createDonationSchema.extend({
  donorName: z.string().trim().max(120).optional().transform((v) => v || undefined),
  donorEmail: z
    .union([z.literal(""), z.email("Correo inválido").trim().toLowerCase()])
    .optional()
    .transform((v) => v || undefined),
});

export async function recordOfflineDonationAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    const admin = await assertRole("ADMIN");
    const { donorEmail, ...input } = offlineSchema.parse(formObject(formData));
    let profileId: string | undefined;
    if (donorEmail) {
      const profile = await findProfileByEmail(donorEmail);
      if (!profile) throw new DomainError("No existe un usuario con ese correo. Déjalo vacío para una donación anónima.");
      profileId = profile.id;
    }
    await recordOfflineDonation(admin.id, { ...input, profileId });
    revalidate();
    revalidatePath("/", "layout");
    return { ok: true, message: profileId ? "Donación registrada y puntos acreditados." : "Donación registrada." };
  } catch (e) {
    return toActionError(e);
  }
}

export async function setMessageHiddenAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    await assertRole("SUPERVISOR", "ADMIN");
    const { id, hidden } = messageVisibilitySchema.parse(formObject(formData));
    await setMessageHidden(id, hidden);
    revalidate();
    revalidatePath("/", "layout");
    return { ok: true, message: hidden ? "Mensaje oculto del sitio." : "Mensaje visible en el sitio." };
  } catch (e) {
    return toActionError(e);
  }
}
