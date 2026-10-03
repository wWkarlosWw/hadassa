"use client";

import { Pencil, Plus } from "lucide-react";
import { Modal } from "@/modules/panel/modal";
import { ActionForm, fieldError } from "@/modules/panel/action-form";
import { Checkbox, Field, Input, Select } from "@/shared/ui/form";
import { SubmitButton } from "@/shared/ui/submit-button";
import { saveMenuItemAction } from "../actions";

export interface MenuItemValue {
  id: string;
  label: string;
  href: string;
  location: "HEADER" | "FOOTER";
  sortOrder: number;
  isVisible: boolean;
  openInNewTab: boolean;
}

export function MenuItemDialog({
  item,
  location = "HEADER",
  suggestions = [],
}: {
  item?: MenuItemValue;
  location?: "HEADER" | "FOOTER";
  suggestions?: { href: string; label: string }[];
}) {
  const editing = Boolean(item);
  const listId = `menu-hrefs-${item?.id ?? location}`;
  return (
    <Modal
      title={editing ? "Editar enlace" : "Nuevo enlace"}
      triggerVariant={editing ? "ghost" : "primary"}
      triggerSize={editing ? "icon" : "sm"}
      triggerAriaLabel={editing ? `Editar ${item?.label}` : undefined}
      triggerIcon={editing ? <Pencil className="size-4" aria-hidden /> : <Plus className="size-4" aria-hidden />}
      triggerLabel={editing ? undefined : "Agregar enlace"}
    >
      {(close) => (
        <ActionForm action={saveMenuItemAction} onSuccess={close} className="space-y-5">
          {(state) => (
            <>
              <input type="hidden" name="id" value={item?.id ?? ""} />
              <input type="hidden" name="sortOrder" value={item?.sortOrder ?? 0} />
              <Field label="Texto del enlace" htmlFor="m-label" error={fieldError(state, "label")}>
                <Input id="m-label" name="label" defaultValue={item?.label} required maxLength={60} />
              </Field>
              <Field
                label="Destino"
                htmlFor="m-href"
                error={fieldError(state, "href")}
                help="Una ruta del sitio (p. ej. /nosotros o /transparencia) o una URL completa (https://…)."
              >
                <Input id="m-href" name="href" defaultValue={item?.href} list={listId} required placeholder="/nosotros" />
                <datalist id={listId}>
                  {suggestions.map((s) => (
                    <option key={s.href} value={s.href}>{s.label}</option>
                  ))}
                </datalist>
              </Field>
              <Field label="Ubicación" htmlFor="m-location">
                <Select id="m-location" name="location" defaultValue={item?.location ?? location}>
                  <option value="HEADER">Menú principal (encabezado)</option>
                  <option value="FOOTER">Pie de página</option>
                </Select>
              </Field>
              <div className="flex flex-wrap gap-6">
                <Checkbox name="isVisible" label="Visible" defaultChecked={item?.isVisible ?? true} />
                <Checkbox name="openInNewTab" label="Abrir en pestaña nueva" defaultChecked={item?.openInNewTab ?? false} />
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
