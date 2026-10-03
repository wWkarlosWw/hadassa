"use client";

import { useActionState } from "react";
import { Mail, MailOpen, Trash2 } from "lucide-react";
import { ConfirmAction } from "@/modules/panel/confirm-action";
import { Button } from "@/shared/ui/button";
import { deleteMessageAction, setMessageReadAction } from "../actions";

export function MessageActions({ id, isRead }: { id: string; isRead: boolean }) {
  const [, toggle, pending] = useActionState(setMessageReadAction, null);
  return (
    <div className="flex shrink-0">
      <form action={toggle}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="isRead" value={String(!isRead)} />
        <Button type="submit" variant="ghost" size="icon" disabled={pending} aria-label={isRead ? "Marcar como no leído" : "Marcar como leído"}>
          {isRead ? <Mail className="size-4" aria-hidden /> : <MailOpen className="size-4" aria-hidden />}
        </Button>
      </form>
      <ConfirmAction
        action={deleteMessageAction}
        fields={{ id }}
        variant="ghost"
        size="icon"
        ariaLabel="Eliminar mensaje"
        icon={<Trash2 className="size-4" aria-hidden />}
        title="Eliminar mensaje"
        confirmLabel="Eliminar"
        confirmVariant="danger"
      />
    </div>
  );
}
