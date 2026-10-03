"use client";

import { useState } from "react";
import { CheckCircle2, QrCode, Landmark } from "lucide-react";
import { ActionForm, fieldError } from "@/modules/panel/action-form";
import { Checkbox, Field, Input, Select, Textarea } from "@/shared/ui/form";
import { SubmitButton } from "@/shared/ui/submit-button";
import { LinkButton } from "@/shared/ui/button";
import { cn, formatNumber } from "@/shared/lib/utils";
import { createDonationAction } from "../actions";

const QUICK = [50, 100, 200, 500];

export function DonationForm({
  projects,
  events,
  defaultProjectId,
  pointsPerBoliviano,
  minDonation,
}: {
  projects: { id: string; name: string; color: string }[];
  events: { id: string; title: string }[];
  defaultProjectId?: string;
  pointsPerBoliviano: number;
  minDonation: number;
}) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"QR" | "TRANSFER">("QR");
  const [done, setDone] = useState(false);
  const n = Number(amount);
  const points = Number.isFinite(n) && n > 0 ? Math.floor(n * pointsPerBoliviano) : 0;

  if (done) {
    return (
      <div className="flex flex-col items-center px-4 py-10 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-exito-50 text-exito">
          <CheckCircle2 className="size-7" aria-hidden />
        </span>
        <p className="mt-4 font-serif text-2xl">¡Gracias por sembrar!</p>
        <p className="mt-1 max-w-sm text-sm text-tinta-suave">
          Registramos tu donación. Cuando el equipo la valide verás tus puntos reflejados en tu panel.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <LinkButton href="/panel/donaciones" size="sm">Ver mis donaciones</LinkButton>
          <button type="button" onClick={() => { setDone(false); setAmount(""); }} className="text-sm font-semibold text-lavanda-700 hover:underline">
            Registrar otra
          </button>
        </div>
      </div>
    );
  }

  return (
    <ActionForm action={createDonationAction} className="space-y-5" onSuccess={() => setDone(true)}>
      {(state) => (
        <>
          <fieldset>
            <legend className="mb-2 text-sm font-medium">¿Cómo donaste?</legend>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ["QR", "Pago QR", QrCode],
                  ["TRANSFER", "Transferencia", Landmark],
                ] as const
              ).map(([value, label, Icon]) => (
                <label
                  key={value}
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-semibold transition has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-lavanda-100",
                    method === value ? "border-lavanda-600 bg-lavanda-50 text-lavanda-700" : "border-borde hover:border-lavanda",
                  )}
                >
                  <input type="radio" name="method" value={value} checked={method === value} onChange={() => setMethod(value)} className="sr-only" />
                  <Icon className="size-4" aria-hidden /> {label}
                </label>
              ))}
            </div>
          </fieldset>

          <Field label="Monto donado (Bs.)" htmlFor="amount" error={fieldError(state, "amount")} help={`Mínimo Bs. ${minDonation}.`}>
            <div className="mb-2 flex flex-wrap gap-2">
              {QUICK.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(String(q))}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-sm font-semibold transition",
                    Number(amount) === q ? "border-vino bg-vino text-white" : "border-borde bg-papel hover:border-rosa",
                  )}
                >
                  Bs. {q}
                </button>
              ))}
            </div>
            <Input
              id="amount"
              name="amount"
              type="number"
              inputMode="decimal"
              min={minDonation}
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Otro monto"
              aria-invalid={Boolean(fieldError(state, "amount"))}
            />
          </Field>

          {points > 0 && (
            <p className="rounded-xl bg-rosa-50 px-4 py-3 text-sm text-vino" aria-live="polite">
              Sumarás <strong className="tabular-nums">{formatNumber(points)} puntos</strong> cuando se valide tu donación.
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Proyecto" htmlFor="projectId" error={fieldError(state, "projectId")}>
              <Select id="projectId" name="projectId" defaultValue={defaultProjectId ?? ""}>
                <option value="">Donde más se necesite</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Actividad (opcional)" htmlFor="eventId">
              <Select id="eventId" name="eventId" defaultValue="">
                <option value="">Ninguna</option>
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="Número de operación / referencia" htmlFor="reference" help="Lo encuentras en el comprobante de tu banco." error={fieldError(state, "reference")}>
            <Input id="reference" name="reference" maxLength={120} placeholder="Ej. 000123456" />
          </Field>

          <Field label="Comprobante (imagen o PDF)" htmlFor="receipt" help="Opcional, pero agiliza la validación. Máx. 10 MB.">
            <input
              id="receipt"
              name="receipt"
              type="file"
              accept="image/png,image/jpeg,image/webp,application/pdf"
              className="block w-full text-sm text-tinta-suave file:mr-3 file:rounded-full file:border-0 file:bg-lavanda-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-lavanda-700 hover:file:bg-lavanda-100"
            />
          </Field>

          <Field
            label="Palabras de apoyo (opcional, públicas)"
            htmlFor="message"
            error={fieldError(state, "message")}
            help="Se muestran en la página de la campaña cuando validamos tu donación."
          >
            <Textarea id="message" name="message" maxLength={500} rows={3} placeholder="¡Con mucho cariño para los niños!" />
          </Field>

          <Field label="Nota para el equipo (opcional, privada)" htmlFor="note" error={fieldError(state, "note")}>
            <Textarea id="note" name="note" maxLength={500} rows={2} placeholder="Destino de tu aporte u otra aclaración" />
          </Field>

          <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
            <Checkbox name="isRecurring" label="Quiero donar este monto cada mes" />
            <Checkbox name="isAnonymous" label="Donar de forma anónima" />
          </div>

          <SubmitButton size="lg" className="w-full" pendingText="Registrando…">
            Registrar mi donación
          </SubmitButton>
        </>
      )}
    </ActionForm>
  );
}
