"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { Button, LinkButton } from "@/shared/ui/button";

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center px-6 pt-24 text-center">
      <p className="eyebrow text-malva">Algo salió mal</p>
      <h1 className="mt-3 font-serif text-4xl text-tinta">No pudimos cargar esta página</h1>
      <p className="mt-3 max-w-md text-tinta-suave">Por favor, inténtalo de nuevo en unos segundos.</p>
      <div className="mt-8 flex gap-3">
        <Button onClick={reset}>
          <RotateCcw className="size-4" aria-hidden /> Reintentar
        </Button>
        <LinkButton href="/" variant="outline">
          Ir al inicio
        </LinkButton>
      </div>
    </section>
  );
}
