"use client";

import { UserCog, X } from "lucide-react";
import { Modal } from "@/modules/panel/modal";
import { ActionForm } from "@/modules/panel/action-form";
import { ConfirmAction } from "@/modules/panel/confirm-action";
import { Select } from "@/shared/ui/form";
import { SubmitButton } from "@/shared/ui/submit-button";
import { assignSupervisorAction, removeSupervisorAction } from "../actions";

export function SupervisorsDialog({
  eventId,
  eventTitle,
  assigned,
  staff,
}: {
  eventId: string;
  eventTitle: string;
  assigned: { id: string; profile: { id: string; fullName: string; email: string } }[];
  staff: { id: string; fullName: string; email: string; role: string }[];
}) {
  const available = staff.filter((s) => !assigned.some((a) => a.profile.id === s.id));
  return (
    <Modal
      title="Supervisores"
      description={eventTitle}
      triggerVariant="ghost"
      triggerSize="icon"
      triggerAriaLabel={`Supervisores de ${eventTitle}`}
      triggerIcon={<UserCog className="size-4" aria-hidden />}
    >
      <div className="space-y-5">
        {assigned.length === 0 ? (
          <p className="text-sm text-tinta-suave">Aún no hay supervisores asignados.</p>
        ) : (
          <ul className="divide-y divide-borde rounded-xl border border-borde">
            {assigned.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{a.profile.fullName}</p>
                  <p className="truncate text-xs text-tinta-suave">{a.profile.email}</p>
                </div>
                <ConfirmAction
                  action={removeSupervisorAction}
                  fields={{ id: a.id }}
                  variant="ghost"
                  size="icon"
                  ariaLabel={`Quitar a ${a.profile.fullName}`}
                  icon={<X className="size-4" aria-hidden />}
                  title="Quitar supervisor"
                  description={`${a.profile.fullName} ya no podrá validar asistencia en esta actividad.`}
                  confirmLabel="Quitar"
                  confirmVariant="danger"
                />
              </li>
            ))}
          </ul>
        )}
        {available.length > 0 ? (
          <ActionForm action={assignSupervisorAction} className="space-y-3">
            <input type="hidden" name="eventId" value={eventId} />
            <label htmlFor={`sup-${eventId}`} className="block text-sm font-medium">Asignar supervisor</label>
            <div className="flex gap-2">
              <Select id={`sup-${eventId}`} name="profileId" required defaultValue="">
                <option value="" disabled>Selecciona…</option>
                {available.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.role === "ADMIN" ? "admin" : "supervisor"})
                  </option>
                ))}
              </Select>
              <SubmitButton>Asignar</SubmitButton>
            </div>
          </ActionForm>
        ) : (
          <p className="text-xs text-tinta-suave">Para asignar a más personas, dales el rol de supervisor en Usuarios.</p>
        )}
      </div>
    </Modal>
  );
}
