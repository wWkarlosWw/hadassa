"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertRole } from "@/modules/auth/session";
import { toActionError, type ActionResult } from "@/shared/lib/action-result";
import { formObject, laPazDateTime, resolveImage } from "@/modules/panel/form-data";
import { projectSchema, projectUpdateSchema } from "./schemas";
import { deleteProject, deleteProjectUpdate, saveProject, saveProjectUpdate } from "./service";

function revalidate() {
  revalidatePath("/panel", "layout");
  revalidatePath("/", "layout");
}

export async function saveProjectAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    await assertRole("ADMIN");
    const [logoUrl, coverUrl] = await Promise.all([
      resolveImage(formData, "logoUrl", "projects"),
      resolveImage(formData, "coverUrl", "projects"),
    ]);
    const fields = formObject(formData);
    const input = projectSchema.parse({ ...fields, endsAt: laPazDateTime(fields.endsAt), logoUrl, coverUrl });
    await saveProject(input);
    revalidate();
    return { ok: true, message: input.id ? "Proyecto actualizado." : "Proyecto creado." };
  } catch (e) {
    return toActionError(e);
  }
}

export async function deleteProjectAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    await assertRole("ADMIN");
    const result = await deleteProject(z.uuid().parse(formData.get("id")));
    revalidate();
    return { ok: true, message: result === "deleted" ? "Proyecto eliminado." : "Tiene donaciones registradas; se desactivó." };
  } catch (e) {
    return toActionError(e);
  }
}

export async function saveProjectUpdateAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    const admin = await assertRole("ADMIN");
    const imageUrl = await resolveImage(formData, "imageUrl", "novedades");
    const input = projectUpdateSchema.parse({ ...formObject(formData), imageUrl });
    await saveProjectUpdate(input, admin.id);
    revalidate();
    return { ok: true, message: input.id ? "Novedad actualizada." : "Novedad publicada." };
  } catch (e) {
    return toActionError(e);
  }
}

export async function deleteProjectUpdateAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    await assertRole("ADMIN");
    await deleteProjectUpdate(z.uuid().parse(formData.get("id")));
    revalidate();
    return { ok: true, message: "Novedad eliminada." };
  } catch (e) {
    return toActionError(e);
  }
}
