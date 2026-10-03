"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { ImageIcon, Loader2, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { listMediaAction } from "../actions";
import type { MediaFile } from "../service";

/** Botón que abre la biblioteca de medios para elegir una imagen. */
export function MediaPicker({ onSelect }: { onSelect: (url: string) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<MediaFile[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  function openPicker() {
    setOpen(true);
    setError(null);
    startTransition(async () => {
      try {
        const res = await listMediaAction();
        if (!res.ok) return setError(res.error);
        setFiles(
          (res.data ?? []).filter(
            (f) => f.mimeType.startsWith("image/") || /\.(png|jpe?g|webp|gif|svg)$/i.test(f.name),
          ),
        );
      } catch {
        setError("No se pudo cargar la biblioteca.");
      }
    });
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={openPicker} aria-haspopup="dialog">
        <ImageIcon className="size-4" aria-hidden />
        Elegir de la biblioteca
      </Button>
      <dialog
        ref={ref}
        onClose={() => setOpen(false)}
        onClick={(e) => e.target === ref.current && setOpen(false)}
        className="m-auto w-[calc(100%-2rem)] max-w-3xl rounded-[var(--radius-card)] bg-papel p-0 text-tinta shadow-2xl backdrop:bg-noche-900/45 backdrop:backdrop-blur-sm"
      >
        {open && (
          <div className="max-h-[85dvh] overflow-y-auto">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-borde bg-papel px-6 py-4">
              <h2 className="font-serif text-xl">Biblioteca de medios</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid size-9 place-items-center rounded-full text-tinta-suave hover:bg-crema"
                aria-label="Cerrar"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="p-6">
              {pending && !files ? (
                <p className="flex items-center gap-2 text-sm text-tinta-suave">
                  <Loader2 className="size-4 animate-spin" aria-hidden /> Cargando imágenes…
                </p>
              ) : error ? (
                <p className="text-sm text-error">{error}</p>
              ) : !files?.length ? (
                <p className="text-sm text-tinta-suave">
                  La biblioteca está vacía. Sube imágenes en Panel → Medios.
                </p>
              ) : (
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {files.map((f) => (
                    <li key={f.path}>
                      <button
                        type="button"
                        onClick={() => {
                          onSelect(f.url);
                          setOpen(false);
                        }}
                        className="group block w-full overflow-hidden rounded-xl border border-borde bg-crema text-left focus-visible:ring-4 focus-visible:ring-lavanda-100"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={f.url} alt={f.name} loading="lazy" className="aspect-square w-full object-cover transition group-hover:scale-105" />
                        <span className="block truncate px-2 py-1.5 text-xs text-tinta-suave">{f.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
