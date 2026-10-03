"use client";

import { useEffect } from "react";
import { Button } from "@/shared/ui/button";

export default function PanelError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="font-serif text-3xl text-tinta">Algo no salió bien</p>
      <p className="mt-2 text-sm text-tinta-suave">
        No pudimos cargar esta sección. Inténtalo de nuevo; si el problema continúa, avisa al equipo de Hadassa.
      </p>
      {error.digest && <p className="mt-2 text-xs text-tinta-suave/70">Código: {error.digest}</p>}
      <Button className="mt-6" onClick={() => retry()}>
        Reintentar
      </Button>
    </div>
  );
}
