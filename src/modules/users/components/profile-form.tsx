"use client";

import { ActionForm, fieldError } from "@/modules/panel/action-form";
import { Field, Input } from "@/shared/ui/form";
import { SubmitButton } from "@/shared/ui/submit-button";
import { updateProfileAction } from "../actions";

export function ProfileForm({ profile }: { profile: { fullName: string; email: string; phone: string | null; ci: string | null; address: string | null } }) {
  return (
    <ActionForm action={updateProfileAction} className="space-y-5">
      {(state) => (
        <>
          <Field label="Correo" htmlFor="email" help="El correo es tu usuario de acceso y no se puede cambiar aquí.">
            <Input id="email" value={profile.email} disabled readOnly />
          </Field>
          <Field label="Nombre completo" htmlFor="fullName" error={fieldError(state, "fullName")}>
            <Input id="fullName" name="fullName" defaultValue={profile.fullName} required autoComplete="name" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Teléfono" htmlFor="phone" error={fieldError(state, "phone")}>
              <Input id="phone" name="phone" defaultValue={profile.phone ?? ""} inputMode="tel" autoComplete="tel" />
            </Field>
            <Field label="Carnet de identidad" htmlFor="ci" error={fieldError(state, "ci")}>
              <Input id="ci" name="ci" defaultValue={profile.ci ?? ""} />
            </Field>
          </div>
          <Field label="Dirección" htmlFor="address" error={fieldError(state, "address")}>
            <Input id="address" name="address" defaultValue={profile.address ?? ""} autoComplete="street-address" />
          </Field>
          <SubmitButton pendingText="Guardando…">Guardar cambios</SubmitButton>
        </>
      )}
    </ActionForm>
  );
}
