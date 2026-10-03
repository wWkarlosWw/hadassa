"use client";

import { Pencil, Plus } from "lucide-react";
import { Modal } from "@/modules/panel/modal";
import { ActionForm, fieldError } from "@/modules/panel/action-form";
import { ImageInput } from "@/modules/panel/image-input";
import { Checkbox, Field, Input, Textarea } from "@/shared/ui/form";
import { SubmitButton } from "@/shared/ui/submit-button";
import { toLocalInput } from "@/modules/panel/dates";
import { saveProjectAction } from "../actions";

export interface ProjectFormValues {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  color: string;
  goal: number | null;
  beneficiaries: number;
  sortOrder: number;
  featured: boolean;
  isActive: boolean;
  logoUrl: string | null;
  coverUrl: string | null;
  category: string;
  location: string;
  story: string;
  endsAt: Date | string | null;
  acceptsDonations: boolean;
}

const BRAND_COLORS = ["#E3AAAA", "#8e9ace", "#525a77", "#7f5153", "#b68286"];

export function ProjectDialog({ project }: { project?: ProjectFormValues }) {
  return (
    <Modal
      title={project ? `Editar ${project.name}` : "Nuevo proyecto"}
      wide
      triggerVariant={project ? "ghost" : "primary"}
      triggerSize={project ? "icon" : "md"}
      triggerAriaLabel={project ? `Editar ${project.name}` : undefined}
      triggerIcon={project ? <Pencil className="size-4" aria-hidden /> : <Plus className="size-4" aria-hidden />}
      triggerLabel={project ? undefined : "Nuevo proyecto"}
    >
      {(close) => (
        <ActionForm action={saveProjectAction} onSuccess={close} className="space-y-5">
          {(state) => (
            <>
              <input type="hidden" name="id" value={project?.id ?? ""} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nombre" htmlFor="p-name" error={fieldError(state, "name")}>
                  <Input id="p-name" name="name" defaultValue={project?.name} required />
                </Field>
                <Field label="Identificador URL" htmlFor="p-slug" error={fieldError(state, "slug")} help="Se genera del nombre si lo dejas vacío.">
                  <Input id="p-slug" name="slug" defaultValue={project?.slug} placeholder="casa-de-fruto" />
                </Field>
              </div>
              <Field label="Frase corta (reverso de la tarjeta)" htmlFor="p-tagline" error={fieldError(state, "tagline")}>
                <Textarea id="p-tagline" name="tagline" rows={2} maxLength={300} defaultValue={project?.tagline} />
              </Field>
              <Field label="Descripción" htmlFor="p-description" error={fieldError(state, "description")}>
                <Textarea id="p-description" name="description" rows={4} defaultValue={project?.description} />
              </Field>
              <fieldset className="space-y-4 rounded-2xl border border-borde p-4">
                <legend className="px-1 text-sm font-semibold text-tinta">Campaña de donación</legend>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Categoría" htmlFor="p-category" error={fieldError(state, "category")} help="Ej. Infancia y educación">
                    <Input id="p-category" name="category" maxLength={60} defaultValue={project?.category} list="p-categories" />
                  </Field>
                  <Field label="Ubicación" htmlFor="p-location" error={fieldError(state, "location")}>
                    <Input id="p-location" name="location" maxLength={120} defaultValue={project?.location} placeholder="La Paz, Bolivia" />
                  </Field>
                  <Field label="Cierre (opcional)" htmlFor="p-ends" error={fieldError(state, "endsAt")} help="Muestra «Quedan N días».">
                    <Input id="p-ends" name="endsAt" type="date" defaultValue={toLocalInput(project?.endsAt).slice(0, 10)} />
                  </Field>
                </div>
                <datalist id="p-categories">
                  {["Infancia y educación", "Alimentación", "Formación espiritual", "Mujeres", "Salud", "Vivienda"].map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
                <Field
                  label="Historia de la campaña"
                  htmlFor="p-story"
                  error={fieldError(state, "story")}
                  help="Texto largo de la ficha pública. Separa párrafos con una línea en blanco. Si lo dejas vacío se usa la descripción."
                >
                  <Textarea id="p-story" name="story" rows={7} defaultValue={project?.story} />
                </Field>
                <Checkbox name="acceptsDonations" label="Recibe donaciones" defaultChecked={project?.acceptsDonations ?? true} />
              </fieldset>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Color" htmlFor="p-color" error={fieldError(state, "color")}>
                  <div className="flex items-center gap-2">
                    <input id="p-color" name="color" type="color" defaultValue={project?.color ?? "#E3AAAA"} list="brand-colors" className="h-11 w-14 cursor-pointer rounded-xl border border-borde bg-papel p-1" />
                    <datalist id="brand-colors">
                      {BRAND_COLORS.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                    <span className="text-xs text-tinta-suave">Paleta Hadassa</span>
                  </div>
                </Field>
                <Field label="Meta (Bs.)" htmlFor="p-goal" error={fieldError(state, "goal")}>
                  <Input id="p-goal" name="goal" type="number" min={0} step="1" defaultValue={project?.goal ?? ""} />
                </Field>
                <Field label="Beneficiarios" htmlFor="p-beneficiaries" error={fieldError(state, "beneficiaries")}>
                  <Input id="p-beneficiaries" name="beneficiaries" type="number" min={0} defaultValue={project?.beneficiaries ?? 0} />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <ImageInput name="logoUrl" label="Logo" defaultValue={project?.logoUrl} />
                <ImageInput name="coverUrl" label="Imagen de portada" defaultValue={project?.coverUrl} />
              </div>
              <div className="flex flex-wrap items-end gap-6">
                <Field label="Orden" htmlFor="p-order" className="w-28">
                  <Input id="p-order" name="sortOrder" type="number" defaultValue={project?.sortOrder ?? 0} />
                </Field>
                <Checkbox name="featured" label="Destacado" defaultChecked={project?.featured ?? false} />
                <Checkbox name="isActive" label="Visible en el sitio" defaultChecked={project?.isActive ?? true} />
              </div>
              <div className="flex justify-end">
                <SubmitButton pendingText="Guardando…">Guardar proyecto</SubmitButton>
              </div>
            </>
          )}
        </ActionForm>
      )}
    </Modal>
  );
}
