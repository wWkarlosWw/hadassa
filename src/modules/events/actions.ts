"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertRole } from "@/modules/auth/session";
import { toActionError, type ActionResult } from "@/shared/lib/action-result";
import { formObject, laPazDateTime, resolveImage } from "@/modules/panel/form-data";
import { formatNumber } from "@/shared/lib/utils";
import { eventSchema } from "./schemas";
import {
  assignSupervisor,
  cancelParticipation,
  deleteEvent,
  markAttendance,
  registerToEvent,
  removeSupervisor,
  saveEvent,
} from "./service";

function revalidate() {
  revalidatePath("/panel", "layout");
  revalidatePath("/", "layout");
}

const id = (formData: FormData, key = "id") => z.uuid().parse(formData.get(key));

export async function saveEventAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    await assertRole("ADMIN");
    const raw = formObject(formData);
    const imageUrl = await resolveImage(formData, "imageUrl", "events");
    const input = eventSchema.parse({
      ...raw,
      startsAt: laPazDateTime(raw.startsAt),
      endsAt: laPazDateTime(raw.endsAt),
      imageUrl,
    });
    await saveEvent(input);
    revalidate();
    return { ok: true, message: input.id ? "Actividad actualizada." : "Actividad creada." };
  } catch (e) {
    return toActionError(e);
  }
}

export async function deleteEventAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    await assertRole("ADMIN");
    const result = await deleteEvent(id(formData));
    revalidate();
    return { ok: true, message: result === "deleted" ? "Actividad eliminada." : "La actividad tiene asistencias registradas; se desactivó." };
  } catch (e) {
    return toActionError(e);
  }
}

export async function registerEventAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    const user = await assertRole();
    await registerToEvent(user.id, id(formData, "eventId"));
    revalidate();
    return { ok: true, message: "¡Te inscribiste! Te esperamos." };
  } catch (e) {
    return toActionError(e);
  }
}

export async function cancelParticipationAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    const user = await assertRole();
    await cancelParticipation(id(formData), user);
    revalidate();
    return { ok: true, message: "Inscripción cancelada." };
  } catch (e) {
    return toActionError(e);
  }
}

export async function markAttendanceAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    const user = await assertRole("SUPERVISOR", "ADMIN");
    const points = await markAttendance(id(formData), user);
    revalidate();
    return { ok: true, message: `Asistencia registrada: +${formatNumber(points)} puntos.` };
  } catch (e) {
    return toActionError(e);
  }
}

export async function assignSupervisorAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    await assertRole("ADMIN");
    await assignSupervisor(id(formData, "profileId"), id(formData, "eventId"));
    revalidate();
    return { ok: true, message: "Supervisor asignado." };
  } catch (e) {
    return toActionError(e);
  }
}

export async function removeSupervisorAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    await assertRole("ADMIN");
    await removeSupervisor(id(formData));
    revalidate();
    return { ok: true, message: "Supervisor removido." };
  } catch (e) {
    return toActionError(e);
  }
}
