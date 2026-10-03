"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertRole } from "@/modules/auth/session";
import { DomainError, toActionError, type ActionResult } from "@/shared/lib/action-result";
import { deleteMedia, listMedia, uploadMedia, type MediaFile } from "./service";

export async function uploadMediaAction(_prev: ActionResult<string[]> | null, formData: FormData): Promise<ActionResult<string[]>> {
  try {
    await assertRole("ADMIN");
    const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
    if (files.length === 0) throw new DomainError("Selecciona al menos una imagen.");
    if (files.length > 20) throw new DomainError("Sube como máximo 20 imágenes a la vez.");
    const urls = await uploadMedia(files);
    revalidatePath("/panel/admin/medios");
    return { ok: true, data: urls, message: urls.length === 1 ? "Imagen subida." : `${urls.length} imágenes subidas.` };
  } catch (e) {
    return toActionError(e);
  }
}

export async function deleteMediaAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    await assertRole("ADMIN");
    await deleteMedia(z.string().min(1).parse(formData.get("path")));
    revalidatePath("/panel/admin/medios");
    return { ok: true, message: "Archivo eliminado." };
  } catch (e) {
    return toActionError(e);
  }
}

/** Lista para el selector de la biblioteca (se llama desde el cliente). */
export async function listMediaAction(): Promise<ActionResult<MediaFile[]>> {
  try {
    await assertRole("ADMIN");
    return { ok: true, data: await listMedia() };
  } catch (e) {
    return toActionError(e);
  }
}
