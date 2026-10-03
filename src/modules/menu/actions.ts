"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertRole } from "@/modules/auth/session";
import { toActionError, type ActionResult } from "@/shared/lib/action-result";
import { formObject } from "@/modules/panel/form-data";
import { menuItemSchema } from "./schemas";
import { deleteMenuItem, moveMenuItem, saveMenuItem, setMenuItemVisible } from "./service";

function revalidate() {
  revalidatePath("/", "layout");
}

export async function saveMenuItemAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    await assertRole("ADMIN");
    const input = menuItemSchema.parse(formObject(formData));
    await saveMenuItem(input);
    revalidate();
    return { ok: true, message: input.id ? "Enlace actualizado." : "Enlace agregado." };
  } catch (e) {
    return toActionError(e);
  }
}

export async function moveMenuItemAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    await assertRole("ADMIN");
    await moveMenuItem(z.uuid().parse(formData.get("id")), z.enum(["up", "down"]).parse(formData.get("direction")));
    revalidate();
    return { ok: true };
  } catch (e) {
    return toActionError(e);
  }
}

export async function toggleMenuItemAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    await assertRole("ADMIN");
    await setMenuItemVisible(z.uuid().parse(formData.get("id")), formData.get("isVisible") === "true");
    revalidate();
    return { ok: true };
  } catch (e) {
    return toActionError(e);
  }
}

export async function deleteMenuItemAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    await assertRole("ADMIN");
    await deleteMenuItem(z.uuid().parse(formData.get("id")));
    revalidate();
    return { ok: true, message: "Enlace eliminado." };
  } catch (e) {
    return toActionError(e);
  }
}
