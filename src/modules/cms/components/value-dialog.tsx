"use client";

import { Pencil, Plus } from "lucide-react";
import { Modal } from "@/modules/panel/modal";
import { ActionForm, fieldError } from "@/modules/panel/action-form";
import { ORG_ICONS } from "@/modules/panel/org-icons";
import { Checkbox, Field, Input, Select, Textarea } from "@/shared/ui/form";
import { SubmitButton } from "@/shared/ui/submit-button";
import { saveCoreValueAction, saveOrgAreaAction } from "../actions";

function triggerProps(editing: boolean, label: string, name?: string) {
  return {
    triggerVariant: editing ? ("ghost" as const) : ("primary" as const),
    triggerSize: editing ? ("icon" as const) : ("md" as const),
    triggerAriaLabel: editing ? `Editar ${name}` : undefined,
    triggerIcon: editing ? <Pencil className="size-4" aria-hidden /> : <Plus className="size-4" aria-hidden />,
    triggerLabel: editing ? undefined : label,
  };
}

export function CoreValueDialog({ value, nextOrder }: { value?: { id: string; title: string; description: string; sortOrder: number; isActive: boolean }; nextOrder?: number }) {
  return (
    <Modal title={value ? "Editar valor" : "Nuevo valor"} {...triggerProps(Boolean(value), "Nuevo valor", value?.title)}>
      {(close) => (
        <ActionForm action={saveCoreValueAction} onSuccess={close} className="space-y-5">
          {(state) => (
            <>
              <input type="hidden" name="id" value={value?.id ?? ""} />
              <Field label="Valor" htmlFor="v-title" error={fieldError(state, "title")}>
                <Input id="v-title" name="title" defaultValue={value?.title} required maxLength={80} />
              </Field>
              <Field label="Descripción" htmlFor="v-desc" error={fieldError(state, "description")} help="Se muestra dentro del fruto: mejor breve (1–2 líneas).">
                <Textarea id="v-desc" name="description" defaultValue={value?.description} rows={3} maxLength={400} required />
              </Field>
              <div className="flex items-end gap-6">
                <Field label="Orden" htmlFor="v-order" className="w-28">
                  <Input id="v-order" name="sortOrder" type="number" defaultValue={value?.sortOrder ?? nextOrder ?? 0} />
                </Field>
                <Checkbox name="isActive" label="Visible" defaultChecked={value?.isActive ?? true} />
              </div>
              <div className="flex justify-end">
                <SubmitButton>Guardar</SubmitButton>
              </div>
            </>
          )}
        </ActionForm>
      )}
    </Modal>
  );
}

export function OrgAreaDialog({ area, nextOrder }: { area?: { id: string; name: string; description: string; icon: string; color: string; sortOrder: number }; nextOrder?: number }) {
  return (
    <Modal title={area ? "Editar área" : "Nueva área"} {...triggerProps(Boolean(area), "Nueva área", area?.name)}>
      {(close) => (
        <ActionForm action={saveOrgAreaAction} onSuccess={close} className="space-y-5">
          {(state) => (
            <>
              <input type="hidden" name="id" value={area?.id ?? ""} />
              <Field label="Nombre del área" htmlFor="o-name" error={fieldError(state, "name")}>
                <Input id="o-name" name="name" defaultValue={area?.name} required maxLength={80} />
              </Field>
              <Field label="Descripción" htmlFor="o-desc" error={fieldError(state, "description")}>
                <Textarea id="o-desc" name="description" defaultValue={area?.description} rows={3} maxLength={400} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-[1fr_auto_6rem]">
                <Field label="Ícono" htmlFor="o-icon">
                  <Select id="o-icon" name="icon" defaultValue={area?.icon ?? "heart"}>
                    {Object.entries(ORG_ICONS).map(([k, { label }]) => (
                      <option key={k} value={k}>{label}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Color" htmlFor="o-color" error={fieldError(state, "color")}>
                  <input id="o-color" name="color" type="color" defaultValue={area?.color ?? "#E3AAAA"} className="h-11 w-16 cursor-pointer rounded-xl border border-borde bg-papel p-1" />
                </Field>
                <Field label="Orden" htmlFor="o-order">
                  <Input id="o-order" name="sortOrder" type="number" defaultValue={area?.sortOrder ?? nextOrder ?? 0} />
                </Field>
              </div>
              <div className="flex justify-end">
                <SubmitButton>Guardar</SubmitButton>
              </div>
            </>
          )}
        </ActionForm>
      )}
    </Modal>
  );
}
