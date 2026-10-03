"use client";

import { Pencil, Plus } from "lucide-react";
import { Modal } from "@/modules/panel/modal";
import { ActionForm, fieldError } from "@/modules/panel/action-form";
import { ImageInput } from "@/modules/panel/image-input";
import { Checkbox, Field, Input, Select, Textarea } from "@/shared/ui/form";
import { SubmitButton } from "@/shared/ui/submit-button";
import { saveEventAction } from "../actions";

export interface EventFormValues {
  id: string;
  title: string;
  description: string;
  location: string;
  startsAt: string; // datetime-local
  endsAt: string;
  capacity: number | null;
  pointsReward: number;
  projectId: string | null;
  isActive: boolean;
  imageUrl: string | null;
}

export function EventDialog({ event, projects }: { event?: EventFormValues; projects: { id: string; name: string }[] }) {
  return (
    <Modal
      title={event ? "Editar actividad" : "Nueva actividad"}
      wide
      triggerVariant={event ? "ghost" : "primary"}
      triggerSize={event ? "icon" : "md"}
      triggerAriaLabel={event ? `Editar ${event.title}` : undefined}
      triggerIcon={event ? <Pencil className="size-4" aria-hidden /> : <Plus className="size-4" aria-hidden />}
      triggerLabel={event ? undefined : "Nueva actividad"}
    >
      {(close) => (
        <ActionForm action={saveEventAction} onSuccess={close} className="space-y-5">
          {(state) => (
            <>
              <input type="hidden" name="id" value={event?.id ?? ""} />
              <Field label="Título" htmlFor="e-title" error={fieldError(state, "title")}>
                <Input id="e-title" name="title" defaultValue={event?.title} required />
              </Field>
              <Field label="Descripción" htmlFor="e-description" error={fieldError(state, "description")}>
                <Textarea id="e-description" name="description" rows={4} defaultValue={event?.description} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Inicio" htmlFor="e-starts" error={fieldError(state, "startsAt")} help="Hora de Bolivia.">
                  <Input id="e-starts" name="startsAt" type="datetime-local" defaultValue={event?.startsAt} required />
                </Field>
                <Field label="Fin (opcional)" htmlFor="e-ends" error={fieldError(state, "endsAt")}>
                  <Input id="e-ends" name="endsAt" type="datetime-local" defaultValue={event?.endsAt} />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Lugar" htmlFor="e-location" error={fieldError(state, "location")}>
                  <Input id="e-location" name="location" defaultValue={event?.location} />
                </Field>
                <Field label="Proyecto" htmlFor="e-project">
                  <Select id="e-project" name="projectId" defaultValue={event?.projectId ?? ""}>
                    <option value="">Sin proyecto</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </Select>
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Cupos (vacío = sin límite)" htmlFor="e-capacity" error={fieldError(state, "capacity")}>
                  <Input id="e-capacity" name="capacity" type="number" min={1} defaultValue={event?.capacity ?? ""} />
                </Field>
                <Field label="Puntos por asistir" htmlFor="e-points" error={fieldError(state, "pointsReward")}>
                  <Input id="e-points" name="pointsReward" type="number" min={0} defaultValue={event?.pointsReward ?? 50} />
                </Field>
              </div>
              <ImageInput name="imageUrl" label="Imagen" defaultValue={event?.imageUrl} />
              <Checkbox name="isActive" label="Actividad publicada" defaultChecked={event?.isActive ?? true} />
              <div className="flex justify-end">
                <SubmitButton pendingText="Guardando…">Guardar actividad</SubmitButton>
              </div>
            </>
          )}
        </ActionForm>
      )}
    </Modal>
  );
}
