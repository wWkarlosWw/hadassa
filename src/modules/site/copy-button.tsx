"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          /* portapapeles no disponible */
        }
      }}
      className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-tinta-suave transition hover:bg-rosa-50 hover:text-vino"
      aria-label={copied ? `${label} copiado` : `Copiar ${label}`}
      title={copied ? "¡Copiado!" : "Copiar"}
    >
      {copied ? <Check className="size-4 text-exito" aria-hidden /> : <Copy className="size-4" aria-hidden />}
    </button>
  );
}
