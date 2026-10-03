"use client";

import { useActionState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff } from "lucide-react";
import { moveMenuItemAction, toggleMenuItemAction } from "../actions";

const iconBtn =
  "grid size-9 place-items-center rounded-full text-tinta-suave transition hover:bg-rosa-50 hover:text-tinta disabled:opacity-30";

function Move({ id, direction, disabled }: { id: string; direction: "up" | "down"; disabled: boolean }) {
  const [, action, pending] = useActionState(moveMenuItemAction, null);
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="direction" value={direction} />
      <button type="submit" className={iconBtn} disabled={disabled || pending} aria-label={direction === "up" ? "Subir" : "Bajar"}>
        {direction === "up" ? <ArrowUp className="size-4" aria-hidden /> : <ArrowDown className="size-4" aria-hidden />}
      </button>
    </form>
  );
}

export function MenuRowActions({ id, isVisible, isFirst, isLast }: { id: string; isVisible: boolean; isFirst: boolean; isLast: boolean }) {
  const [, toggle, pending] = useActionState(toggleMenuItemAction, null);
  return (
    <div className="flex items-center">
      <Move id={id} direction="up" disabled={isFirst} />
      <Move id={id} direction="down" disabled={isLast} />
      <form action={toggle}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="isVisible" value={isVisible ? "false" : "true"} />
        <button type="submit" className={iconBtn} disabled={pending} aria-label={isVisible ? "Ocultar" : "Mostrar"}>
          {isVisible ? <Eye className="size-4" aria-hidden /> : <EyeOff className="size-4" aria-hidden />}
        </button>
      </form>
    </div>
  );
}
