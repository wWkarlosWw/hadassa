"use client";

import { ActionForm, fieldError } from "@/modules/panel/action-form";
import { Field, Input } from "@/shared/ui/form";
import { SubmitButton } from "@/shared/ui/submit-button";
import { changePasswordAction } from "../actions";

export function PasswordForm() {
  return (
    <ActionForm action={changePasswordAction} resetOnSuccess className="space-y-4">
      {(state) => (
        <>
          <Field label="Nueva contraseña" htmlFor="password" error={fieldError(state, "password")} help="Mínimo 8 caracteres, con letras y números.">
            <Input id="password" name="password" type="password" autoComplete="new-password" required />
          </Field>
          <Field label="Repite la contraseña" htmlFor="confirmPassword" error={fieldError(state, "confirmPassword")}>
            <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required />
          </Field>
          <SubmitButton variant="outline" pendingText="Actualizando…">Cambiar contraseña</SubmitButton>
        </>
      )}
    </ActionForm>
  );
}
