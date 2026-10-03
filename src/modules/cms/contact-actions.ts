"use server";

import { z } from "zod";
import { toActionError, type ActionResult } from "@/shared/lib/action-result";
import { createContactMessage, getSection } from "./service";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Ingresa tu nombre").max(120),
  email: z.string().trim().toLowerCase().pipe(z.email("Ingresa un correo válido")),
  phone: z.string().trim().max(20).optional().transform((v) => v || undefined),
  message: z.string().trim().min(10, "Cuéntanos un poco más (mínimo 10 caracteres)").max(3000),
});

/** Formulario público de contacto (con campo trampa anti-spam). */
export async function sendContactMessage(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  // Honeypot: los humanos no ven este campo.
  const { successMessage } = await getSection("contactPage");
  if (String(formData.get("website") ?? "").length > 0) {
    return { ok: true, message: successMessage };
  }
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? undefined,
    message: formData.get("message"),
  });
  if (!parsed.success) return toActionError(parsed.error);
  try {
    await createContactMessage(parsed.data);
    return { ok: true, message: successMessage };
  } catch (e) {
    return toActionError(e);
  }
}
