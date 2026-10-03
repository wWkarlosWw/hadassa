"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useId, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Heart, LogIn, Repeat, Sparkles, UserRound, UserX } from "lucide-react";
import { createDonationAction } from "@/modules/donations/actions";
import { fillTemplate } from "@/modules/cms/definitions";
import { pointsForDonation } from "@/modules/points/rules";
import { QUICK_AMOUNTS } from "@/modules/projects/campaign";
import { CopyButton } from "@/modules/site/copy-button";
import { QrCode } from "@/modules/site/qr-code";
import { Button, buttonClasses } from "@/shared/ui/button";
import { Field, FormMessage, Input, Select, Textarea } from "@/shared/ui/form";
import { SubmitButton } from "@/shared/ui/submit-button";
import { cn, formatBs, formatDate, formatNumber } from "@/shared/lib/utils";
import type { ActionResult } from "@/shared/lib/action-result";
import { ShareButtons } from "./share-buttons";
import { CampaignProgress } from "./campaign-progress";

export interface WizardLabels {
  stepAmount: string;
  stepPay: string;
  stepConfirm: string;
  amountTitle: string;
  customAmount: string;
  pointsHint: string;
  recurringLabel: string;
  recurringHelp: string;
  anonymousLabel: string;
  anonymousHelp: string;
  messageLabel: string;
  messagePlaceholder: string;
  payTitle: string;
  payText: string;
  referenceLabel: string;
  receiptLabel: string;
  confirmTitle: string;
  submitButton: string;
  successTitle: string;
  successText: string;
  successShare: string;
  loginTitle: string;
  loginText: string;
  loginButton: string;
  registerButton: string;
  shareButton: string;
  quickTitle: string;
  chooseTitle: string;
  mainChipLabel: string;
  raisedLabel: string;
  goalLabel: string;
}

export interface WizardProject {
  id: string;
  slug: string;
  name: string;
  color: string;
  coverUrl: string | null;
  isMain: boolean;
  raised: number;
  goal: number | null;
}

interface Props {
  projects: WizardProject[];
  initialProjectId: string;
  labels: WizardLabels;
  bank: { label: string; value: string; copy?: boolean }[];
  qrImageUrl: string;
  qrPayload: string;
  pointsPerBoliviano: number;
  minDonation: number;
  events: { id: string; title: string; startsAt: string; projectId: string | null }[];
  isLoggedIn: boolean;
  /** Ruta a la que volver tras iniciar sesión (se agrega ?proyecto=). */
  returnPath: string;
  siteUrl: string;
}

type Step = 0 | 1 | 2;

export function DonationWizard(p: Props) {
  const { labels: L } = p;
  const [state, action] = useActionState<ActionResult | null, FormData>(createDonationAction, null);
  const [step, setStep] = useState<Step>(0);
  const [projectId, setProjectId] = useState(p.initialProjectId);
  const project = p.projects.find((x) => x.id === projectId) ?? p.projects[0];
  const events = p.events.filter((e) => e.projectId === project.id);
  const shareUrl = `${p.siteUrl}/donar/${project.slug}`;
  const back = `${p.returnPath}?proyecto=${project.slug}`;
  const loginHref = `/ingresar?next=${encodeURIComponent(back)}`;
  const registerHref = `/registro?next=${encodeURIComponent(back)}`;
  const [amount, setAmount] = useState<number | "">(100);
  const [custom, setCustom] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [anonymous, setAnonymous] = useState(false);
  const [message, setMessage] = useState("");
  const [method, setMethod] = useState<"QR" | "TRANSFER">("QR");
  const [reference, setReference] = useState("");
  const [receiptName, setReceiptName] = useState("");
  const ids = useId();

  const value = typeof amount === "number" ? amount : Number(custom.replace(",", "."));
  const validAmount = Number.isFinite(value) && value >= p.minDonation;
  const points = validAmount ? pointsForDonation(value, p.pointsPerBoliviano) : 0;
  const steps = [L.stepAmount, L.stepPay, L.stepConfirm];

  if (state?.ok) {
    return (
      <div className="rounded-[var(--radius-card)] border border-borde bg-papel p-8 text-center shadow-[var(--shadow-flor)] sm:p-12" role="status">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-exito-50 text-exito">
          <Check className="size-8" aria-hidden />
        </span>
        <h2 className="mt-6 font-serif text-3xl text-tinta">{L.successTitle}</h2>
        <p className="mx-auto mt-3 max-w-md leading-relaxed text-tinta-suave">{L.successText}</p>
        <p className="mt-2 text-sm font-semibold text-vino">
          {formatBs(value)} · {project.name}
          {points > 0 && ` · +${formatNumber(points)} pts`}
        </p>
        <p className="mt-8 text-sm text-tinta">{L.successShare}</p>
        <ShareButtons url={shareUrl} text={`Doné a ${project.name}. ¡Súmate!`} label={L.shareButton} className="mt-3 justify-center" />
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/panel/donaciones" className={buttonClasses("outline", "md")}>
            Ver mis donaciones
          </Link>
          <Link href={`/donar/${project.slug}`} className={buttonClasses("primary", "md")}>
            Volver a la campaña
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="rounded-[var(--radius-card)] border border-borde bg-papel shadow-[var(--shadow-flor)]">
      <input type="hidden" name="projectId" value={project.id} />
      <input type="hidden" name="amount" value={validAmount ? String(value) : ""} />
      <input type="hidden" name="method" value={method} />
      <input type="hidden" name="isRecurring" value={String(recurring)} />
      <input type="hidden" name="isAnonymous" value={String(anonymous)} />

      {/* Indicador de pasos */}
      <ol className="flex border-b border-borde text-xs font-semibold sm:text-sm">
        {steps.map((label, i) => (
          <li
            key={label}
            aria-current={step === i ? "step" : undefined}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 px-2 py-4",
              step === i ? "text-vino" : i < step ? "text-tinta" : "text-tinta-suave",
            )}
          >
            <span
              className={cn(
                "grid size-6 shrink-0 place-items-center rounded-full text-xs",
                step === i ? "bg-vino text-white" : i < step ? "bg-exito text-white" : "bg-borde text-tinta-suave",
              )}
            >
              {i < step ? <Check className="size-3.5" aria-hidden /> : i + 1}
            </span>
            <span className="truncate">{label}</span>
          </li>
        ))}
      </ol>

      <div className="p-5 sm:p-8">
        {/* Paso 1: monto y preferencias */}
        <div hidden={step !== 0} className="space-y-6">
          {p.projects.length > 1 && (
            <fieldset>
              <legend className="font-serif text-2xl text-tinta">{L.chooseTitle}</legend>
              <div role="radiogroup" className="mt-4 flex flex-wrap gap-2">
                {p.projects.map((x) => (
                  <button
                    key={x.id}
                    type="button"
                    role="radio"
                    aria-checked={x.id === project.id}
                    onClick={() => setProjectId(x.id)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition",
                      x.id === project.id ? "border-vino bg-vino text-white shadow" : "border-borde bg-crema text-tinta hover:border-rosa",
                    )}
                  >
                    <span className="size-2.5 rounded-full ring-2 ring-white/70" style={{ background: x.color }} aria-hidden />
                    {x.isMain ? `${x.name} · ${L.mainChipLabel}` : x.name}
                  </button>
                ))}
              </div>
            </fieldset>
          )}
          <div className="flex items-center gap-4 rounded-2xl border border-borde bg-crema p-3">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-xl" style={{ background: project.color }}>
              {project.coverUrl && <Image src={project.coverUrl} alt="" fill sizes="64px" className="object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-serif text-lg text-tinta">{project.name}</p>
              <CampaignProgress raised={project.raised} goal={project.goal} color={project.color} raisedLabel={L.raisedLabel} goalLabel={L.goalLabel} />
            </div>
          </div>
        <fieldset className="space-y-6">
          <legend className="font-serif text-2xl text-tinta">{L.amountTitle}</legend>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {QUICK_AMOUNTS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => {
                  setAmount(q);
                  setCustom("");
                }}
                aria-pressed={amount === q}
                className={cn(
                  "h-12 rounded-xl border text-sm font-semibold transition",
                  amount === q ? "border-vino bg-vino text-white shadow" : "border-borde bg-crema text-tinta hover:border-rosa",
                )}
              >
                Bs {q}
              </button>
            ))}
          </div>
          <Field label={L.customAmount} htmlFor={`${ids}-custom`} help={`Mínimo ${formatBs(p.minDonation)}`}>
            <Input
              id={`${ids}-custom`}
              inputMode="decimal"
              placeholder="Ej. 150"
              value={custom}
              onChange={(e) => {
                setCustom(e.target.value);
                setAmount("");
              }}
              aria-invalid={custom !== "" && !validAmount}
            />
          </Field>
          {points > 0 && (
            <p className="flex items-center gap-2 rounded-xl bg-lavanda-50 px-4 py-3 text-sm text-lavanda-700">
              <Sparkles className="size-4 shrink-0" aria-hidden /> {fillTemplate(L.pointsHint, { n: formatNumber(points) })}
            </p>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <ToggleCard
              checked={recurring}
              onChange={setRecurring}
              icon={<Repeat className="size-4" aria-hidden />}
              label={L.recurringLabel}
              help={L.recurringHelp}
            />
            <ToggleCard
              checked={anonymous}
              onChange={setAnonymous}
              icon={anonymous ? <UserX className="size-4" aria-hidden /> : <UserRound className="size-4" aria-hidden />}
              label={L.anonymousLabel}
              help={L.anonymousHelp}
            />
          </div>

          <Field label={L.messageLabel} htmlFor={`${ids}-msg`} help={`${message.length}/500`}>
            <Textarea
              id={`${ids}-msg`}
              name="message"
              maxLength={500}
              placeholder={L.messagePlaceholder}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-24"
            />
          </Field>

          <div className="flex justify-end">
            <Button variant="vino" size="lg" disabled={!validAmount} onClick={() => setStep(1)}>
              {L.stepPay} <ArrowRight className="size-4" aria-hidden />
            </Button>
          </div>
        </fieldset>
        </div>

        {/* Paso 2: pago */}
        <fieldset hidden={step !== 1} className="space-y-6">
          <legend className="font-serif text-2xl text-tinta">{L.payTitle}</legend>
          <p className="text-sm leading-relaxed text-tinta-suave">{L.payText}</p>
          <div className="grid gap-5 sm:grid-cols-[13rem_1fr]">
            <div className="rounded-2xl bg-crema p-4">
              {p.qrImageUrl ? (
                <Image src={p.qrImageUrl} alt="Código QR para donar" width={240} height={240} className="h-auto w-full rounded-lg" />
              ) : (
                <QrCode value={p.qrPayload} />
              )}
              <p className="mt-2 text-center text-xs text-tinta-suave">{L.quickTitle}</p>
            </div>
            <dl className="space-y-2 self-center">
              <div className="rounded-xl bg-rosa-50 px-4 py-3">
                <dt className="text-xs text-tinta-suave">Monto</dt>
                <dd className="font-serif text-2xl text-vino">{validAmount ? formatBs(value) : "—"}</dd>
              </div>
              {p.bank.map((b) => (
                <div key={b.label} className="flex items-center justify-between gap-2 border-b border-borde/70 py-1.5 text-sm">
                  <dt className="text-tinta-suave">{b.label}</dt>
                  <dd className="flex items-center gap-1 text-right font-medium text-tinta">
                    <span className="break-all">{b.value}</span>
                    {b.copy && <CopyButton value={b.value} label={b.label} />}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {p.isLoggedIn ? (
            <>
              <div role="radiogroup" aria-label="Método de pago" className="grid grid-cols-2 gap-2">
                {(["QR", "TRANSFER"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="radio"
                    aria-checked={method === m}
                    onClick={() => setMethod(m)}
                    className={cn(
                      "h-11 rounded-xl border text-sm font-semibold transition",
                      method === m ? "border-lavanda-600 bg-lavanda-50 text-lavanda-700" : "border-borde text-tinta-suave hover:border-lavanda",
                    )}
                  >
                    {m === "QR" ? "Pago QR" : "Transferencia"}
                  </button>
                ))}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={L.referenceLabel} htmlFor={`${ids}-ref`}>
                  <Input id={`${ids}-ref`} name="reference" maxLength={120} value={reference} onChange={(e) => setReference(e.target.value)} />
                </Field>
                <Field label={L.receiptLabel} htmlFor={`${ids}-receipt`}>
                  <Input
                    id={`${ids}-receipt`}
                    type="file"
                    name="receipt"
                    accept="image/png,image/jpeg,image/webp,application/pdf"
                    onChange={(e) => setReceiptName(e.target.files?.[0]?.name ?? "")}
                    className="h-auto py-2 file:mr-3 file:rounded-full file:border-0 file:bg-rosa-100 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-vino"
                  />
                </Field>
              </div>
              {events.length > 0 && (
                <Field label="¿Es para una actividad? (opcional)" htmlFor={`${ids}-event`}>
                  <Select id={`${ids}-event`} name="eventId" defaultValue="">
                    <option value="">No, para la campaña en general</option>
                    {events.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.title} · {formatDate(e.startsAt)}
                      </option>
                    ))}
                  </Select>
                </Field>
              )}
              <div className="flex justify-between gap-3">
                <Button variant="ghost" onClick={() => setStep(0)}>
                  <ArrowLeft className="size-4" aria-hidden /> {L.stepAmount}
                </Button>
                <Button variant="vino" size="lg" onClick={() => setStep(2)}>
                  {L.stepConfirm} <ArrowRight className="size-4" aria-hidden />
                </Button>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-lavanda-100 bg-lavanda-50 p-5">
              <p className="flex items-center gap-2 font-serif text-xl text-tinta">
                <LogIn className="size-5 text-lavanda-600" aria-hidden /> {L.loginTitle}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-tinta-suave">{L.loginText}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href={loginHref} className={buttonClasses("primary", "md")}>
                  {L.loginButton}
                </Link>
                <Link href={registerHref} className={buttonClasses("outline", "md")}>
                  {L.registerButton}
                </Link>
              </div>
              <Button variant="ghost" className="mt-3" onClick={() => setStep(0)}>
                <ArrowLeft className="size-4" aria-hidden /> {L.stepAmount}
              </Button>
            </div>
          )}
        </fieldset>

        {/* Paso 3: confirmación */}
        <fieldset hidden={step !== 2} className="space-y-6">
          <legend className="font-serif text-2xl text-tinta">{L.confirmTitle}</legend>
          <dl className="divide-y divide-borde rounded-2xl border border-borde">
            {[
              ["Campaña", project.name],
              ["Monto", validAmount ? formatBs(value) : "—"],
              ["Frecuencia", recurring ? "Mensual" : "Única vez"],
              ["Método", method === "QR" ? "Pago QR" : "Transferencia"],
              ["Visibilidad", anonymous ? "Anónima" : "Con mi nombre"],
              ["Referencia", reference || "—"],
              ["Comprobante", receiptName || "Sin adjuntar"],
              ["Mensaje", message || "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 px-4 py-3 text-sm">
                <dt className="text-tinta-suave">{k}</dt>
                <dd className="max-w-[65%] text-right font-medium break-words text-tinta">{v}</dd>
              </div>
            ))}
          </dl>
          {points > 0 && (
            <p className="flex items-center gap-2 text-sm text-lavanda-700">
              <Sparkles className="size-4" aria-hidden /> {fillTemplate(L.pointsHint, { n: formatNumber(points) })}
            </p>
          )}
          <FormMessage state={state} />
          <div className="flex flex-col-reverse justify-between gap-3 sm:flex-row">
            <Button variant="ghost" onClick={() => setStep(1)}>
              <ArrowLeft className="size-4" aria-hidden /> {L.stepPay}
            </Button>
            <SubmitButton variant="vino" size="lg" pendingText="Registrando…" disabled={!validAmount}>
              <Heart className="size-4 fill-current" aria-hidden /> {L.submitButton}
            </SubmitButton>
          </div>
        </fieldset>
      </div>
    </form>
  );
}

function ToggleCard({
  checked,
  onChange,
  icon,
  label,
  help,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  icon: React.ReactNode;
  label: string;
  help: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex items-start gap-3 rounded-xl border p-4 text-left transition",
        checked ? "border-lavanda-600 bg-lavanda-50" : "border-borde hover:border-lavanda",
      )}
    >
      <span className={cn("mt-0.5 grid size-8 shrink-0 place-items-center rounded-full", checked ? "bg-lavanda-600 text-white" : "bg-crema text-tinta-suave")}>
        {icon}
      </span>
      <span>
        <span className="block text-sm font-semibold text-tinta">{label}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-tinta-suave">{help}</span>
      </span>
    </button>
  );
}
