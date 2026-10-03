"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/shared/ui/button";

export function CopyUrlButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          // El navegador no permite el portapapeles: no hacemos nada.
        }
      }}
      aria-label="Copiar URL de la imagen"
    >
      {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
      {copied ? "Copiada" : "Copiar URL"}
    </Button>
  );
}
