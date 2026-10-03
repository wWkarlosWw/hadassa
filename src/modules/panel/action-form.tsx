"use client";

import { useActionState, useEffect, useRef } from "react";
import { FormMessage } from "@/shared/ui/form";
import type { ActionResult } from "@/shared/lib/action-result";

export type FormAction = (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;

/**
 * Formulario conectado a una Server Action con `useActionState`.
 * `children` puede ser función para leer errores por campo (solo desde cliente).
 */
export function ActionForm({
  action,
  children,
  className,
  resetOnSuccess,
  onSuccess,
  hideMessage,
}: {
  action: FormAction;
  children: React.ReactNode | ((state: ActionResult | null) => React.ReactNode);
  className?: string;
  resetOnSuccess?: boolean;
  onSuccess?: (state: ActionResult) => void;
  hideMessage?: boolean;
}) {
  const [state, formAction] = useActionState(action, null);
  const ref = useRef<HTMLFormElement>(null);
  const onSuccessRef = useRef(onSuccess);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  });

  useEffect(() => {
    if (!state?.ok) return;
    if (resetOnSuccess) ref.current?.reset();
    onSuccessRef.current?.(state);
  }, [state, resetOnSuccess]);

  return (
    <form ref={ref} action={formAction} className={className} noValidate>
      {!hideMessage && <FormMessage state={state} />}
      {typeof children === "function" ? children(state) : children}
    </form>
  );
}

/** Errores de un campo concreto. */
export function fieldError(state: ActionResult | null, name: string) {
  return state && !state.ok ? state.fieldErrors?.[name] : undefined;
}
