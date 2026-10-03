"use client";

import { Pencil, Plus } from "lucide-react";
import { Modal } from "@/modules/panel/modal";
import { ActionForm, fieldError } from "@/modules/panel/action-form";
import { ImageInput } from "@/modules/panel/image-input";
import { Field, Input, Textarea } from "@/shared/ui/form";
import { SubmitButton } from "@/shared/ui/submit-button";
import { saveProjectUpdateAction } from "../actions";

export interface UpdateFormValues {
  id: string;
  title: string;
  body: string;
  imageUrl: string | null;
}

/** Crear/editar una novedad de la campaña. */
export function UpdateDialog({ projectId, update }: { projectId: string; update?: UpdateFormValues }) {
  return (
    <Modal
      title={update ? "Editar novedad" : "Nueva novedad"}
      wide
      triggerVariant={update ? "ghost" : "primary"}
      triggerSize={update ? "icon" : "md"}
      triggerAriaLabel={update ? `Editar ${update.title}` : undefined}
      triggerIcon={update ? <Pencil className="size-4" aria-hidden /> : <Plus className="size-4" aria-hidden />}
      triggerLabel={update ? undefined : "Publicar novedad"}
    >
      {(close) => (
        <ActionForm action={saveProjectUpdateAction} onSuccess={close} className="space-y-5">
          {(state) => (
            <>
              <input type="hidden" name="id" value={update?.id ?? ""} />
              <input type="hidden" name="projectId" value={projectId} />
              <Field label="Título" htmlFor="u-title" error={fieldError(state, "title")}>
                <Input id="u-title" name="title" maxLength={150} defaultValue={update?.title} required />
              </Field>
              <Field label="Texto" htmlFor="u-body" error={fieldError(state, "body")} help="Cuéntales a los donantes cómo avanza la campaña.">
                <Textarea id="u-body" name="body" rows={6} maxLength={5000} defaultValue={update?.body} />
              </Field>
              <ImageInput name="imageUrl" label="Imagen (opcional)" defaultValue={update?.imageUrl} />
              <div className="flex justify-end">
                <SubmitButton pendingText="Guardando…">{update ? "Guardar cambios" : "Publicar"}</SubmitButton>
              </div>
            </>
          )}
        </ActionForm>
      )}
    </Modal>
  );
}
