"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Button, type ButtonSize, type ButtonVariant } from "@/shared/ui/button";
import { SubmitButton } from "@/shared/ui/submit-button";
import { FormMessage } from "@/shared/ui/form";
import type { FormAction } from "./action-form";

/**
 * Botón que pide confirmación en un <dialog> y luego ejecuta la acción con
 * los campos ocultos indicados. Opcionalmente pide un texto (p. ej. motivo).
 */
export function ConfirmAction({
  action,
  fields,
  label,
  icon,
  title,
  description,
  confirmLabel = "Confirmar",
  variant = "outline",
  confirmVariant = "primary",
  size = "sm",
  ariaLabel,
  reasonField,
  reasonLabel,
  className,
}: {
  action: FormAction;
  fields: Record<string, string>;
  label?: React.ReactNode;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  confirmLabel?: string;
  variant?: ButtonVariant;
  confirmVariant?: ButtonVariant;
  size?: ButtonSize;
  ariaLabel?: string;
  reasonField?: string;
  reasonLabel?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(0);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <>
      <Button variant={variant} size={size} onClick={() => { setSession((n) => n + 1); setOpen(true); }} aria-label={ariaLabel} className={className} aria-haspopup="dialog">
        {icon}
        {label}
      </Button>
      <dialog
        ref={ref}
        onClose={() => setOpen(false)}
        onClick={(e) => e.target === ref.current && setOpen(false)}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-[var(--radius-card)] bg-papel p-0 text-tinta shadow-2xl backdrop:bg-noche-900/45 backdrop:backdrop-blur-sm"
      >
        {open && (
          <ConfirmBody
            key={session}
            action={action}
            fields={fields}
            title={title}
            description={description}
            confirmLabel={confirmLabel}
            confirmVariant={confirmVariant}
            reasonField={reasonField}
            reasonLabel={reasonLabel}
            onDone={() => setOpen(false)}
          />
        )}
      </dialog>
    </>
  );
}

function ConfirmBody({
  action,
  fields,
  title,
  description,
  confirmLabel,
  confirmVariant,
  reasonField,
  reasonLabel,
  onDone,
}: {
  action: FormAction;
  fields: Record<string, string>;
  title: string;
  description?: string;
  confirmLabel: string;
  confirmVariant: ButtonVariant;
  reasonField?: string;
  reasonLabel?: string;
  onDone: () => void;
}) {
  const [state, formAction] = useActionState(action, null);
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  });
  useEffect(() => {
    if (state?.ok) onDoneRef.current();
  }, [state]);

  return (
    <form action={formAction} className="space-y-4 p-6">
      <div>
        <h2 className="font-serif text-xl">{title}</h2>
        {description && <p className="mt-1 text-sm text-tinta-suave">{description}</p>}
      </div>
      {Object.entries(fields).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      {reasonField && (
        <label className="block space-y-1.5 text-sm font-medium">
          <span>{reasonLabel ?? "Motivo (opcional)"}</span>
          <textarea
            name={reasonField}
            rows={3}
            maxLength={300}
            className="w-full rounded-xl border border-borde px-3.5 py-2.5 text-sm font-normal focus:border-lavanda focus:ring-4 focus:ring-lavanda-100 focus:outline-none"
          />
        </label>
      )}
      {state && !state.ok && <FormMessage state={state} />}
      <div className="flex justify-end gap-2 pt-1">
        <Button variant="ghost" onClick={onDone}>
          Cancelar
        </Button>
        <SubmitButton variant={confirmVariant}>{confirmLabel}</SubmitButton>
      </div>
    </form>
  );
}
