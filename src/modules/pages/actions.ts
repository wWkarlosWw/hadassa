"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { assertRole } from "@/modules/auth/session";
import { toActionError, type ActionResult } from "@/shared/lib/action-result";
import { formObject, resolveImage } from "@/modules/panel/form-data";
import { pageSchema } from "./schemas";
import { deletePage, savePage, setPagePublished } from "./service";

export async function savePageAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  let createdId: string | null = null;
  try {
    await assertRole("ADMIN");
    const raw = formObject(formData);
    const input = pageSchema.parse({ ...raw, coverUrl: await resolveImage(formData, "coverUrl", "paginas") });
    const page = await savePage(input);
    revalidatePath("/", "layout");
    if (!input.id) createdId = page.id;
    else return { ok: true, message: input.published ? "Página guardada y publicada." : "Borrador guardado." };
  } catch (e) {
    return toActionError(e);
  }
  redirect(`/panel/admin/paginas/${createdId}?creada=1`);
}

export async function togglePagePublishedAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    await assertRole("ADMIN");
    const id = z.uuid().parse(formData.get("id"));
    const published = formData.get("published") === "true";
    await setPagePublished(id, published);
    revalidatePath("/", "layout");
    return { ok: true, message: published ? "Página publicada." : "Página despublicada." };
  } catch (e) {
    return toActionError(e);
  }
}

export async function deletePageAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    await assertRole("ADMIN");
    await deletePage(z.uuid().parse(formData.get("id")));
    revalidatePath("/", "layout");
    return { ok: true, message: "Página eliminada." };
  } catch (e) {
    return toActionError(e);
  }
}
