"use client";

import { useActionState, useState } from "react";
import type { ActionResult } from "@/shared/lib/action-result";

type Action = (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;

/**
 * `useActionState` que recuerda los valores enviados. React 19 reinicia los
 * campos no controlados tras cada envío; con `values` + `formKey` los campos
 * se vuelven a montar con lo que el usuario escribió (salvo contraseñas).
 */
export function useStickyAction(action: Action) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [formKey, setFormKey] = useState(0);
  const [state, formAction] = useActionState(async (prev: ActionResult | null, fd: FormData) => {
    const result = await action(prev, fd);
    if (!result.ok) {
      const kept: Record<string, string> = {};
      fd.forEach((v, k) => {
        if (typeof v === "string" && !/password/i.test(k)) kept[k] = v;
      });
      setValues(kept);
    } else {
      setValues({});
    }
    setFormKey((k) => k + 1);
    return result;
  }, null);
  return { state, formAction, values, formKey };
}
