"use client";

import { ActionForm, fieldError } from "@/modules/panel/action-form";
import { Field, Input, Select, Textarea } from "@/shared/ui/form";
import { SubmitButton } from "@/shared/ui/submit-button";
import { recordOfflineDonationAction } from "../actions";

export function OfflineDonationForm({ projects, events }: { projects: { id: string; name: string }[]; events: { id: string; title: string }[] }) {
  return (
    <ActionForm action={recordOfflineDonationAction} resetOnSuccess className="space-y-5">
      {(state) => (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Monto (Bs.)" htmlFor="amount" error={fieldError(state, "amount")}>
              <Input id="amount" name="amount" type="number" min={1} step="0.01" required inputMode="decimal" />
            </Field>
            <Field label="Medio" htmlFor="method">
              <Select id="method" name="method" defaultValue="CASH">
                <option value="CASH">Efectivo</option>
                <option value="TRANSFER">Transferencia / depósito</option>
                <option value="QR">Pago QR</option>
                <option value="OTHER">Otro</option>
              </Select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Correo del donante registrado" htmlFor="donorEmail" help="Si está registrado, recibirá sus puntos." error={fieldError(state, "donorEmail")}>
              <Input id="donorEmail" name="donorEmail" type="email" placeholder="opcional" />
            </Field>
            <Field label="Nombre del donante" htmlFor="donorName" help="Para donantes sin cuenta o anónimos.">
              <Input id="donorName" name="donorName" maxLength={120} placeholder="opcional" />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Proyecto" htmlFor="projectId">
              <Select id="projectId" name="projectId" defaultValue="">
                <option value="">Fondo general</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Actividad" htmlFor="eventId">
              <Select id="eventId" name="eventId" defaultValue="">
                <option value="">Ninguna</option>
                {events.map((e) => (
                  <option key={e.id} value={e.id}>{e.title}</option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Referencia / recibo" htmlFor="reference">
            <Input id="reference" name="reference" maxLength={120} />
          </Field>
          <Field label="Nota interna" htmlFor="note">
            <Textarea id="note" name="note" rows={3} maxLength={500} />
          </Field>
          <SubmitButton variant="vino" pendingText="Guardando…">Registrar y aprobar</SubmitButton>
        </>
      )}
    </ActionForm>
  );
}
