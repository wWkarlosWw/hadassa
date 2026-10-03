"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button, type ButtonSize, type ButtonVariant } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

/**
 * Diálogo accesible basado en <dialog> nativo (foco atrapado, Escape, backdrop).
 * `children` puede ser una función que recibe `close` (solo desde componentes cliente).
 */
export function Modal({
  triggerLabel,
  triggerIcon,
  triggerVariant = "outline",
  triggerSize = "sm",
  triggerClassName,
  triggerAriaLabel,
  title,
  description,
  wide,
  children,
}: {
  triggerLabel?: React.ReactNode;
  triggerIcon?: React.ReactNode;
  triggerVariant?: ButtonVariant;
  triggerSize?: ButtonSize;
  triggerClassName?: string;
  triggerAriaLabel?: string;
  title: string;
  description?: string;
  wide?: boolean;
  children: React.ReactNode | ((close: () => void) => React.ReactNode);
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <Button
        variant={triggerVariant}
        size={triggerSize}
        className={triggerClassName}
        onClick={() => setOpen(true)}
        aria-label={triggerAriaLabel}
        aria-haspopup="dialog"
      >
        {triggerIcon}
        {triggerLabel}
      </Button>
      <dialog
        ref={ref}
        onClose={close}
        onClick={(e) => e.target === ref.current && close()}
        className={cn(
          "m-auto w-[calc(100%-2rem)] rounded-[var(--radius-card)] bg-papel p-0 text-tinta shadow-2xl backdrop:bg-noche-900/45 backdrop:backdrop-blur-sm",
          wide ? "max-w-2xl" : "max-w-lg",
        )}
      >
        {open && (
          <div className="max-h-[85dvh] overflow-y-auto">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-borde bg-papel px-6 py-4">
              <div>
                <h2 className="font-serif text-xl">{title}</h2>
                {description && <p className="mt-0.5 text-sm text-tinta-suave">{description}</p>}
              </div>
              <button
                type="button"
                onClick={close}
                className="grid size-9 shrink-0 place-items-center rounded-full text-tinta-suave hover:bg-crema"
                aria-label="Cerrar"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="px-6 py-5">{typeof children === "function" ? children(close) : children}</div>
          </div>
        )}
      </dialog>
    </>
  );
}
