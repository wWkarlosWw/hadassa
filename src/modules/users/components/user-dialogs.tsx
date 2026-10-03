"use client";

import { Coins, Plus, UserCog } from "lucide-react";
import { Modal } from "@/modules/panel/modal";
import { ActionForm, fieldError } from "@/modules/panel/action-form";
import { Checkbox, Field, Input, Select } from "@/shared/ui/form";
import { SubmitButton } from "@/shared/ui/submit-button";
import { formatNumber } from "@/shared/lib/utils";
import { adjustPointsAction, createUserAction, updateUserAccessAction } from "../actions";

const ROLE_OPTIONS = [
  ["USER", "Donante / voluntario"],
  ["SUPERVISOR", "Supervisor"],
  ["ADMIN", "Administrador"],
] as const;

export function UserAccessDialog({ user, isSelf }: { user: { id: string; fullName: string; role: string; isActive: boolean }; isSelf: boolean }) {
  return (
    <Modal
      title="Rol y acceso"
      description={user.fullName}
      triggerVariant="ghost"
      triggerSize="icon"
      triggerAriaLabel={`Rol y acceso de ${user.fullName}`}
      triggerIcon={<UserCog className="size-4" aria-hidden />}
    >
      {(close) => (
        <ActionForm action={updateUserAccessAction} onSuccess={close} className="space-y-5">
          <input type="hidden" name="id" value={user.id} />
          <Field label="Rol" htmlFor={`role-${user.id}`}>
            <Select id={`role-${user.id}`} name="role" defaultValue={user.role}>
              {ROLE_OPTIONS.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </Select>
          </Field>
          <ul className="space-y-1 rounded-xl bg-crema p-4 text-xs text-tinta-suave">
            <li><strong className="text-tinta">Supervisor:</strong> valida donaciones y la asistencia de sus actividades.</li>
            <li><strong className="text-tinta">Administrador:</strong> acceso total, incluido el contenido del sitio.</li>
          </ul>
          <Checkbox name="isActive" label="Cuenta activa (puede iniciar sesión)" defaultChecked={user.isActive} />
          {isSelf && <p className="text-xs text-alerta">Es tu propia cuenta: no puedes quitarte el rol de administrador ni desactivarla.</p>}
          <div className="flex justify-end">
            <SubmitButton>Guardar</SubmitButton>
          </div>
        </ActionForm>
      )}
    </Modal>
  );
}

export function AdjustPointsDialog({ user }: { user: { id: string; fullName: string; points: number } }) {
  return (
    <Modal
      title="Ajustar puntos"
      description={`${user.fullName} · saldo actual ${formatNumber(user.points)} pts`}
      triggerVariant="ghost"
      triggerSize="icon"
      triggerAriaLabel={`Ajustar puntos de ${user.fullName}`}
      triggerIcon={<Coins className="size-4" aria-hidden />}
    >
      {(close) => (
        <ActionForm action={adjustPointsAction} onSuccess={close} className="space-y-5">
          {(state) => (
            <>
              <input type="hidden" name="id" value={user.id} />
              <Field label="Cantidad" htmlFor={`amt-${user.id}`} help="Usa un número negativo para descontar." error={fieldError(state, "amount")}>
                <Input id={`amt-${user.id}`} name="amount" type="number" step={1} required />
              </Field>
              <Field label="Motivo" htmlFor={`desc-${user.id}`} error={fieldError(state, "description")} help="Queda registrado en el historial del usuario.">
                <Input id={`desc-${user.id}`} name="description" required maxLength={200} />
              </Field>
              <div className="flex justify-end">
                <SubmitButton>Aplicar ajuste</SubmitButton>
              </div>
            </>
          )}
        </ActionForm>
      )}
    </Modal>
  );
}

export function CreateUserDialog() {
  return (
    <Modal title="Nuevo usuario" triggerVariant="primary" triggerSize="md" triggerIcon={<Plus className="size-4" aria-hidden />} triggerLabel="Nuevo usuario">
      {(close) => (
        <ActionForm action={createUserAction} onSuccess={close} className="space-y-5">
          {(state) => (
            <>
              <Field label="Nombre completo" htmlFor="nu-name" error={fieldError(state, "fullName")}>
                <Input id="nu-name" name="fullName" required />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Correo" htmlFor="nu-email" error={fieldError(state, "email")}>
                  <Input id="nu-email" name="email" type="email" required autoComplete="off" />
                </Field>
                <Field label="Teléfono" htmlFor="nu-phone">
                  <Input id="nu-phone" name="phone" inputMode="tel" />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Rol" htmlFor="nu-role">
                  <Select id="nu-role" name="role" defaultValue="USER">
                    {ROLE_OPTIONS.map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Contraseña inicial" htmlFor="nu-pass" error={fieldError(state, "password")} help="Compártela de forma segura.">
                  <Input id="nu-pass" name="password" type="text" minLength={8} required autoComplete="new-password" />
                </Field>
              </div>
              <div className="flex justify-end">
                <SubmitButton pendingText="Creando…">Crear usuario</SubmitButton>
              </div>
            </>
          )}
        </ActionForm>
      )}
    </Modal>
  );
}
