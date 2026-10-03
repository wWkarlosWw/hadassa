"use client";

import { LogIn } from "lucide-react";
import { loginAction } from "@/modules/auth/actions";
import { useStickyAction } from "../use-sticky-action";
import { Field, FormMessage, Input } from "@/shared/ui/form";
import { SubmitButton } from "@/shared/ui/submit-button";

export function LoginForm({ next }: { next?: string }) {
  const { state, formAction, values, formKey } = useStickyAction(loginAction);
  const fe = state && !state.ok ? state.fieldErrors : undefined;
  return (
    <form key={formKey} action={formAction} className="space-y-5" noValidate>
      <input type="hidden" name="next" value={next ?? "/panel"} />
      <Field label="Correo electrónico" htmlFor="email" error={fe?.email}>
        <Input id="email" name="email" type="email" autoComplete="email" defaultValue={values.email} required aria-invalid={!!fe?.email} placeholder="tucorreo@ejemplo.com" />
      </Field>
      <Field label="Contraseña" htmlFor="password" error={fe?.password}>
        <Input id="password" name="password" type="password" autoComplete="current-password" required aria-invalid={!!fe?.password} />
      </Field>
      <FormMessage state={state} />
      <SubmitButton size="lg" className="w-full" pendingText="Ingresando…">
        <LogIn className="size-4" aria-hidden /> Ingresar
      </SubmitButton>
    </form>
  );
}
