"use client";

import { Pencil, Plus } from "lucide-react";
import { Modal } from "@/modules/panel/modal";
import { ActionForm, fieldError } from "@/modules/panel/action-form";
import { ImageInput } from "@/modules/panel/image-input";
import { Checkbox, Field, Input, Select, Textarea } from "@/shared/ui/form";
import { SubmitButton } from "@/shared/ui/submit-button";
import { saveAllyAction, saveRewardAction } from "../actions";

export interface RewardFormValues {
  id: string;
  title: string;
  description: string;
  code: string;
  discountPercent: number | null;
  pointsCost: number;
  stock: number | null;
  expiresAt: string; // yyyy-mm-dd
  allyId: string | null;
  imageUrl: string | null;
  isActive: boolean;
}

function trigger(editing: boolean, label: string, name?: string) {
  return {
    triggerVariant: editing ? ("ghost" as const) : ("primary" as const),
    triggerSize: editing ? ("icon" as const) : ("md" as const),
    triggerAriaLabel: editing ? `Editar ${name}` : undefined,
    triggerIcon: editing ? <Pencil className="size-4" aria-hidden /> : <Plus className="size-4" aria-hidden />,
    triggerLabel: editing ? undefined : label,
  };
}

export function RewardDialog({ reward, allies }: { reward?: RewardFormValues; allies: { id: string; name: string }[] }) {
  return (
    <Modal title={reward ? "Editar recompensa" : "Nueva recompensa"} wide {...trigger(Boolean(reward), "Nueva recompensa", reward?.title)}>
      {(close) => (
        <ActionForm action={saveRewardAction} onSuccess={close} className="space-y-5">
          {(state) => (
            <>
              <input type="hidden" name="id" value={reward?.id ?? ""} />
              <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
                <Field label="Título" htmlFor="r-title" error={fieldError(state, "title")}>
                  <Input id="r-title" name="title" defaultValue={reward?.title} required />
                </Field>
                <Field label="Código a entregar" htmlFor="r-code" error={fieldError(state, "code")}>
                  <Input id="r-code" name="code" defaultValue={reward?.code} required className="font-mono uppercase" />
                </Field>
              </div>
              <Field label="Descripción / condiciones" htmlFor="r-description" error={fieldError(state, "description")}>
                <Textarea id="r-description" name="description" rows={3} defaultValue={reward?.description} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Costo en puntos" htmlFor="r-cost" error={fieldError(state, "pointsCost")}>
                  <Input id="r-cost" name="pointsCost" type="number" min={1} defaultValue={reward?.pointsCost ?? 100} required />
                </Field>
                <Field label="Descuento %" htmlFor="r-discount" error={fieldError(state, "discountPercent")}>
                  <Input id="r-discount" name="discountPercent" type="number" min={1} max={100} defaultValue={reward?.discountPercent ?? ""} />
                </Field>
                <Field label="Stock (vacío = ilimitado)" htmlFor="r-stock" error={fieldError(state, "stock")}>
                  <Input id="r-stock" name="stock" type="number" min={0} defaultValue={reward?.stock ?? ""} />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Aliado" htmlFor="r-ally">
                  <Select id="r-ally" name="allyId" defaultValue={reward?.allyId ?? ""}>
                    <option value="">Fundación Hadassa</option>
                    {allies.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Vence (opcional)" htmlFor="r-expires" error={fieldError(state, "expiresAt")}>
                  <Input id="r-expires" name="expiresAt" type="date" defaultValue={reward?.expiresAt} />
                </Field>
              </div>
              <ImageInput name="imageUrl" label="Imagen" defaultValue={reward?.imageUrl} />
              <Checkbox name="isActive" label="Disponible para canje" defaultChecked={reward?.isActive ?? true} />
              <div className="flex justify-end">
                <SubmitButton pendingText="Guardando…">Guardar recompensa</SubmitButton>
              </div>
            </>
          )}
        </ActionForm>
      )}
    </Modal>
  );
}

export interface AllyFormValues {
  id: string;
  name: string;
  description: string;
  website: string | null;
  contactEmail: string | null;
  logoUrl: string | null;
  isActive: boolean;
}

export function AllyDialog({ ally }: { ally?: AllyFormValues }) {
  return (
    <Modal title={ally ? "Editar aliado" : "Nuevo aliado"} {...trigger(Boolean(ally), "Nuevo aliado", ally?.name)} triggerVariant={ally ? "ghost" : "outline"}>
      {(close) => (
        <ActionForm action={saveAllyAction} onSuccess={close} className="space-y-5">
          {(state) => (
            <>
              <input type="hidden" name="id" value={ally?.id ?? ""} />
              <Field label="Nombre del comercio / empresa" htmlFor="a-name" error={fieldError(state, "name")}>
                <Input id="a-name" name="name" defaultValue={ally?.name} required />
              </Field>
              <Field label="Descripción" htmlFor="a-description">
                <Textarea id="a-description" name="description" rows={3} defaultValue={ally?.description} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Sitio web" htmlFor="a-web" error={fieldError(state, "website")}>
                  <Input id="a-web" name="website" type="url" defaultValue={ally?.website ?? ""} placeholder="https://" />
                </Field>
                <Field label="Correo de contacto" htmlFor="a-email" error={fieldError(state, "contactEmail")}>
                  <Input id="a-email" name="contactEmail" type="email" defaultValue={ally?.contactEmail ?? ""} />
                </Field>
              </div>
              <ImageInput name="logoUrl" label="Logo" defaultValue={ally?.logoUrl} />
              <Checkbox name="isActive" label="Aliado activo" defaultChecked={ally?.isActive ?? true} />
              <div className="flex justify-end">
                <SubmitButton pendingText="Guardando…">Guardar aliado</SubmitButton>
              </div>
            </>
          )}
        </ActionForm>
      )}
    </Modal>
  );
}
