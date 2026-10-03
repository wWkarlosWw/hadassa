"use client";

import { Eye, EyeOff } from "lucide-react";
import { ConfirmAction } from "@/modules/panel/confirm-action";
import { setMessageHiddenAction } from "../actions";

/** Oculta o vuelve a mostrar las "palabras de apoyo" de una donación. */
export function MessageVisibilityButton({ id, hidden }: { id: string; hidden: boolean }) {
  return hidden ? (
    <ConfirmAction
      action={setMessageHiddenAction}
      fields={{ id, hidden: "false" }}
      variant="outline"
      size="sm"
      icon={<Eye className="size-4" aria-hidden />}
      label="Mostrar"
      title="Mostrar mensaje"
      description="El mensaje volverá a verse en la página pública de la campaña (si la donación está aprobada)."
      confirmLabel="Mostrar"
    />
  ) : (
    <ConfirmAction
      action={setMessageHiddenAction}
      fields={{ id, hidden: "true" }}
      variant="ghost"
      size="sm"
      icon={<EyeOff className="size-4" aria-hidden />}
      label="Ocultar"
      title="Ocultar mensaje"
      description="El mensaje dejará de verse en la página pública. La donación no cambia."
      confirmLabel="Ocultar"
      confirmVariant="danger"
    />
  );
}
