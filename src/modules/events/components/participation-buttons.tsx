"use client";

import { useActionState } from "react";
import { CalendarPlus } from "lucide-react";
import { SubmitButton } from "@/shared/ui/submit-button";
import { FormMessage } from "@/shared/ui/form";
import { ConfirmAction } from "@/modules/panel/confirm-action";
import { cancelParticipationAction, markAttendanceAction, registerEventAction } from "../actions";

export function RegisterEventButton({ eventId, disabled }: { eventId: string; disabled?: boolean }) {
  const [state, action] = useActionState(registerEventAction, null);
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="eventId" value={eventId} />
      <SubmitButton size="sm" disabled={disabled} pendingText="Inscribiendo…">
        <CalendarPlus className="size-4" aria-hidden /> {disabled ? "Sin cupos" : "Inscribirme"}
      </SubmitButton>
      {state && !state.ok && <FormMessage state={state} />}
    </form>
  );
}

export function CancelParticipationButton({ id, title }: { id: string; title: string }) {
  return (
    <ConfirmAction
      action={cancelParticipationAction}
      fields={{ id }}
      variant="ghost"
      label="Cancelar inscripción"
      title="Cancelar inscripción"
      description={`¿Ya no podrás asistir a “${title}”? Liberarás tu cupo para otra persona.`}
      confirmLabel="Sí, cancelar"
      confirmVariant="danger"
    />
  );
}

export function MarkAttendanceButton({ id, name, points }: { id: string; name: string; points: number }) {
  return (
    <ConfirmAction
      action={markAttendanceAction}
      fields={{ id }}
      variant="primary"
      label="Marcar asistencia"
      title="Confirmar asistencia"
      description={`${name} recibirá ${points} puntos por asistir.`}
      confirmLabel="Confirmar"
    />
  );
}
