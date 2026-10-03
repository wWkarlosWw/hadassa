"use client";

import { UserPlus } from "lucide-react";
import { registerAction } from "@/modules/auth/actions";
import { useStickyAction } from "../use-sticky-action";
import { Field, FormMessage, Input } from "@/shared/ui/form";
import { SubmitButton } from "@/shared/ui/submit-button";

export function RegisterForm({ next }: { next?: string }) {
  const { state, formAction, values, formKey } = useStickyAction(registerAction);
  const fe = state && !state.ok ? state.fieldErrors : undefined;

  if (state?.ok) {
    return <FormMessage state={state} />;
  }

  return (
    <form key={formKey} action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next ?? "/panel"} />
      <Field label="Nombre completo" htmlFor="fullName" error={fe?.fullName}>
        <Input id="fullName" name="fullName" defaultValue={values.fullName} autoComplete="name" required aria-invalid={!!fe?.fullName} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Correo electrónico" htmlFor="email" error={fe?.email}>
          <Input id="email" name="email" defaultValue={values.email} type="email" autoComplete="email" required aria-invalid={!!fe?.email} />
        </Field>
        <Field label="Teléfono" htmlFor="phone" error={fe?.phone}>
          <Input id="phone" name="phone" defaultValue={values.phone} type="tel" autoComplete="tel" required aria-invalid={!!fe?.phone} placeholder="70000000" />
        </Field>
      </div>
      <Field label="Contraseña" htmlFor="password" error={fe?.password} help="Mínimo 8 caracteres, con letras y números.">
        <Input id="password" name="password" type="password" autoComplete="new-password" required aria-invalid={!!fe?.password} />
      </Field>
      <Field label="Confirmar contraseña" htmlFor="confirmPassword" error={fe?.confirmPassword}>
        <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required aria-invalid={!!fe?.confirmPassword} />
      </Field>
      <FormMessage state={state} />
      <SubmitButton size="lg" className="w-full" pendingText="Creando cuenta…">
        <UserPlus className="size-4" aria-hidden /> Crear mi cuenta
      </SubmitButton>
    </form>
  );
}
