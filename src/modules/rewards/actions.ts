"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertRole } from "@/modules/auth/session";
import { toActionError, type ActionResult } from "@/shared/lib/action-result";
import { formObject, laPazDateTime, resolveImage } from "@/modules/panel/form-data";
import { allySchema, rewardSchema } from "./schemas";
import { cancelClaim, claimReward, deleteAlly, deleteReward, redeemClaim, saveAlly, saveReward } from "./service";

function revalidate() {
  revalidatePath("/panel", "layout");
}

const id = (formData: FormData, key = "id") => z.uuid().parse(formData.get(key));

export async function saveRewardAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    await assertRole("ADMIN");
    const raw = formObject(formData);
    const imageUrl = await resolveImage(formData, "imageUrl", "rewards");
    const input = rewardSchema.parse({ ...raw, expiresAt: laPazDateTime(raw.expiresAt), imageUrl });
    await saveReward(input);
    revalidate();
    return { ok: true, message: input.id ? "Recompensa actualizada." : "Recompensa creada." };
  } catch (e) {
    return toActionError(e);
  }
}

export async function deleteRewardAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    await assertRole("ADMIN");
    const result = await deleteReward(id(formData));
    revalidate();
    return { ok: true, message: result === "deleted" ? "Recompensa eliminada." : "Tenía canjes; se desactivó." };
  } catch (e) {
    return toActionError(e);
  }
}

export async function saveAllyAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    await assertRole("ADMIN");
    const logoUrl = await resolveImage(formData, "logoUrl", "allies");
    const input = allySchema.parse({ ...formObject(formData), logoUrl });
    await saveAlly(input);
    revalidate();
    return { ok: true, message: input.id ? "Aliado actualizado." : "Aliado creado." };
  } catch (e) {
    return toActionError(e);
  }
}

export async function deleteAllyAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    await assertRole("ADMIN");
    await deleteAlly(id(formData));
    revalidate();
    return { ok: true, message: "Aliado eliminado. Sus recompensas quedaron sin aliado." };
  } catch (e) {
    return toActionError(e);
  }
}

export async function claimRewardAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    const user = await assertRole();
    const { code } = await claimReward(user.id, id(formData, "rewardId"));
    revalidate();
    return { ok: true, message: `¡Canje exitoso! Tu código es ${code}.` };
  } catch (e) {
    return toActionError(e);
  }
}

export async function redeemClaimAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    const user = await assertRole("ADMIN");
    await redeemClaim(id(formData), user.id);
    revalidate();
    return { ok: true, message: "Canje marcado como usado." };
  } catch (e) {
    return toActionError(e);
  }
}

export async function cancelClaimAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    const user = await assertRole("ADMIN");
    await cancelClaim(id(formData), user.id);
    revalidate();
    return { ok: true, message: "Canje cancelado y puntos devueltos." };
  } catch (e) {
    return toActionError(e);
  }
}
