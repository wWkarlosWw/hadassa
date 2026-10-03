"use client";

import { Upload } from "lucide-react";
import { ActionForm, type FormAction } from "@/modules/panel/action-form";
import { SubmitButton } from "@/shared/ui/submit-button";
import { uploadMediaAction } from "../actions";

// La acción devuelve las URLs subidas; aquí solo interesa el mensaje.
const upload: FormAction = async (_prev, formData) => {
  const res = await uploadMediaAction(null, formData);
  return res.ok ? { ok: true, message: res.message } : res;
};

export function MediaUploadForm() {
  return (
    <ActionForm action={upload} resetOnSuccess className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex-1">
          <span className="sr-only">Imágenes</span>
          <input
            type="file"
            name="files"
            multiple
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            className="block w-full text-sm text-tinta-suave file:mr-3 file:rounded-full file:border-0 file:bg-lavanda-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-lavanda-700 hover:file:bg-lavanda-100"
          />
        </label>
        <SubmitButton pendingText="Subiendo…">
          <Upload className="size-4" aria-hidden />
          Subir imágenes
        </SubmitButton>
      </div>
      <p className="text-xs text-tinta-suave">PNG, JPG, WebP, GIF o SVG. Hasta 10 MB cada una, máximo 20 por vez.</p>
    </ActionForm>
  );
}
