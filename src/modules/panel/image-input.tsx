"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { MediaPicker } from "@/modules/media/components/media-picker";

/**
 * Campo de imagen: muestra la actual, permite subir otra, pegar una URL o
 * elegirla de la biblioteca. Envía `${name}` (URL) y `${name}File` (archivo nuevo).
 */
export function ImageInput({ name, label, defaultValue, help }: { name: string; label: string; defaultValue?: string | null; help?: string }) {
  const [preview, setPreview] = useState<string | null>(defaultValue || null);
  const [url, setUrl] = useState(defaultValue ?? "");

  return (
    <div className="space-y-1.5">
      <span className="block text-sm font-medium text-tinta">{label}</span>
      <div className="flex items-start gap-4">
        <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-dashed border-borde bg-crema">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="size-full object-cover" />
          ) : (
            <Upload className="size-5 text-tinta-suave" aria-hidden />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <input
            type="file"
            name={`${name}File`}
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            aria-label={`${label}: subir archivo`}
            className="block w-full text-sm text-tinta-suave file:mr-3 file:rounded-full file:border-0 file:bg-lavanda-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-lavanda-700 hover:file:bg-lavanda-100"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setPreview(URL.createObjectURL(f));
            }}
          />
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              name={name}
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setPreview(e.target.value || null);
              }}
              placeholder="…o pega una URL / ruta (/images/…)"
              aria-label={`${label}: URL`}
              className="h-9 min-w-0 flex-1 rounded-lg border border-borde bg-papel px-3 text-xs focus:border-lavanda focus:ring-4 focus:ring-lavanda-100 focus:outline-none"
            />
            <MediaPicker
              onSelect={(picked) => {
                setUrl(picked);
                setPreview(picked);
              }}
            />
          </div>
          {help && <p className="text-xs text-tinta-suave">{help}</p>}
        </div>
      </div>
    </div>
  );
}
