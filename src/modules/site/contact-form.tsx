"use client";

import { Send } from "lucide-react";
import { sendContactMessage } from "@/modules/cms/contact-actions";
import { useStickyAction } from "./use-sticky-action";
import { Field, FormMessage, Input, Textarea } from "@/shared/ui/form";
import { SubmitButton } from "@/shared/ui/submit-button";

export interface ContactFormLabels {
  name: string;
  phone: string;
  email: string;
  message: string;
  submit: string;
}

export function ContactForm({ labels }: { labels: ContactFormLabels }) {
  const { state, formAction, values, formKey } = useStickyAction(sendContactMessage);
  const fe = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <form key={formKey} action={formAction} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={labels.name} htmlFor="c-name" error={fe?.name}>
          <Input id="c-name" name="name" defaultValue={values.name} autoComplete="name" required aria-invalid={!!fe?.name} />
        </Field>
        <Field label={labels.phone} htmlFor="c-phone" error={fe?.phone}>
          <Input id="c-phone" name="phone" defaultValue={values.phone} type="tel" autoComplete="tel" />
        </Field>
      </div>
      <Field label={labels.email} htmlFor="c-email" error={fe?.email}>
        <Input id="c-email" name="email" defaultValue={values.email} type="email" autoComplete="email" required aria-invalid={!!fe?.email} />
      </Field>
      <Field label={labels.message} htmlFor="c-message" error={fe?.message}>
        <Textarea id="c-message" name="message" defaultValue={values.message} rows={5} required aria-invalid={!!fe?.message} />
      </Field>
      {/* Campo trampa anti-spam */}
      <div className="hidden" aria-hidden>
        <label>
          No llenar <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <FormMessage state={state} />
      <SubmitButton pendingText="Enviando…" size="lg" className="w-full sm:w-auto">
        <Send className="size-4" aria-hidden /> {labels.submit}
      </SubmitButton>
    </form>
  );
}
