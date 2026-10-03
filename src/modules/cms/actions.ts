"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertRole } from "@/modules/auth/session";
import { DomainError, toActionError, type ActionResult } from "@/shared/lib/action-result";
import { formObject, resolveImage } from "@/modules/panel/form-data";
import { SITE_SECTIONS, isSectionKey, type FieldDef } from "./definitions";
import { coerceList } from "./coerce";
import {
  deleteContactMessage,
  deleteCoreValue,
  deleteOrgArea,
  saveSection,
  setContactMessageRead,
  upsertCoreValue,
  upsertOrgArea,
} from "./service";

function revalidate() {
  revalidatePath("/", "layout");
}

const optionalId = z.uuid().optional().or(z.literal("").transform(() => undefined));
const bool = z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean());

const coreValueSchema = z.object({
  id: optionalId,
  title: z.string().trim().min(2, "Ingresa un título").max(80),
  description: z.string().trim().min(5, "Ingresa una descripción").max(400),
  sortOrder: z.coerce.number().int().default(0),
  isActive: bool,
});

const orgAreaSchema = z.object({
  id: optionalId,
  name: z.string().trim().min(2, "Ingresa un nombre").max(80),
  description: z.string().trim().max(400).default(""),
  icon: z.string().trim().min(1).max(40).default("heart"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color inválido"),
  sortOrder: z.coerce.number().int().default(0),
});

export async function saveSectionAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    await assertRole("ADMIN");
    const key = String(formData.get("_section") ?? "");
    if (!isSectionKey(key)) throw new DomainError("Sección desconocida.");
    const raw = formObject(formData);
    const values: Record<string, unknown> = {};
    for (const field of SITE_SECTIONS[key].fields as readonly FieldDef[]) {
      if (field.type === "image") values[field.name] = await resolveImage(formData, field.name, `cms/${key}`);
      else if (field.type === "toggle") values[field.name] = raw[field.name] === "on" || raw[field.name] === "true";
      else if (field.type === "list") {
        const items = coerceList(field, raw[field.name] ?? "[]");
        for (const sub of field.itemFields ?? []) {
          if (sub.type !== "url" && sub.type !== "image") continue;
          if (items.some((it) => it[sub.name] && !/^(\/(?!\/)|#|https?:\/\/|mailto:|tel:)/i.test(it[sub.name]))) {
            return { ok: false, error: "Revisa los datos del formulario.", fieldErrors: { [field.name]: [`«${sub.label}» debe ser una ruta (/…) o una URL https://`] } };
          }
        }
        values[field.name] = items;
      } else if (field.type === "number") {
        const n = Number(raw[field.name]);
        if (raw[field.name] === "" || !Number.isFinite(n) || n < 0) {
          return { ok: false, error: "Revisa los datos del formulario.", fieldErrors: { [field.name]: ["Ingresa un número válido"] } };
        }
        values[field.name] = n;
      } else values[field.name] = (raw[field.name] ?? "").trim();
    }
    await saveSection(key, values);
    revalidate();
    return { ok: true, message: "Contenido guardado. Los cambios ya están publicados." };
  } catch (e) {
    return toActionError(e);
  }
}

export async function saveCoreValueAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    await assertRole("ADMIN");
    const input = coreValueSchema.parse(formObject(formData));
    await upsertCoreValue(input);
    revalidate();
    return { ok: true, message: input.id ? "Valor actualizado." : "Valor creado." };
  } catch (e) {
    return toActionError(e);
  }
}

export async function deleteCoreValueAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    await assertRole("ADMIN");
    await deleteCoreValue(z.uuid().parse(formData.get("id")));
    revalidate();
    return { ok: true, message: "Valor eliminado." };
  } catch (e) {
    return toActionError(e);
  }
}

export async function saveOrgAreaAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    await assertRole("ADMIN");
    const input = orgAreaSchema.parse(formObject(formData));
    await upsertOrgArea(input);
    revalidate();
    return { ok: true, message: input.id ? "Área actualizada." : "Área creada." };
  } catch (e) {
    return toActionError(e);
  }
}

export async function deleteOrgAreaAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    await assertRole("ADMIN");
    await deleteOrgArea(z.uuid().parse(formData.get("id")));
    revalidate();
    return { ok: true, message: "Área eliminada." };
  } catch (e) {
    return toActionError(e);
  }
}

export async function setMessageReadAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    await assertRole("ADMIN");
    await setContactMessageRead(z.uuid().parse(formData.get("id")), formData.get("isRead") === "true");
    revalidatePath("/panel", "layout");
    return { ok: true };
  } catch (e) {
    return toActionError(e);
  }
}

export async function deleteMessageAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    await assertRole("ADMIN");
    await deleteContactMessage(z.uuid().parse(formData.get("id")));
    revalidatePath("/panel", "layout");
    return { ok: true, message: "Mensaje eliminado." };
  } catch (e) {
    return toActionError(e);
  }
}
