"use client";

import { ActionForm, fieldError } from "@/modules/panel/action-form";
import { ImageInput } from "@/modules/panel/image-input";
import { Checkbox, Field, Input, Textarea } from "@/shared/ui/form";
import { SubmitButton } from "@/shared/ui/submit-button";
import type { ActionResult } from "@/shared/lib/action-result";
import type { FieldDef, FieldValue, ListItem } from "../definitions";
import { saveSectionAction } from "../actions";
import { ListField } from "./list-field";

const INPUT_TYPE: Record<string, string> = { url: "text", number: "number", phone: "tel", email: "email", text: "text" };

/** Agrupa campos consecutivos con el mismo `group`. */
function groupFields(fields: FieldDef[]) {
  const groups: { title?: string; fields: FieldDef[] }[] = [];
  for (const f of fields) {
    const last = groups.at(-1);
    if (last && last.title === f.group) last.fields.push(f);
    else groups.push({ title: f.group, fields: [f] });
  }
  return groups;
}

function FieldControl({ f, value, state }: { f: FieldDef; value: FieldValue | undefined; state: ActionResult | null }) {
  const id = `cms-${f.name}`;
  if (f.type === "image") return <ImageInput name={f.name} label={f.label} defaultValue={String(value ?? "")} help={f.help} />;
  if (f.type === "list") return <ListField field={f} defaultValue={Array.isArray(value) ? (value as ListItem[]) : []} error={fieldError(state, f.name)} />;
  if (f.type === "toggle")
    return (
      <div className="space-y-1">
        <Checkbox name={f.name} label={f.label} defaultChecked={value === true} />
        {f.help && <p className="text-xs text-tinta-suave">{f.help}</p>}
      </div>
    );
  const text = String(value ?? "");
  return (
    <Field label={f.label} htmlFor={id} help={f.help} error={fieldError(state, f.name)}>
      {f.type === "textarea" ? (
        <Textarea id={id} name={f.name} defaultValue={text} rows={text.length > 280 ? 7 : 4} />
      ) : (
        <Input
          id={id}
          name={f.name}
          type={INPUT_TYPE[f.type] ?? "text"}
          defaultValue={text}
          min={f.type === "number" ? 0 : undefined}
          step={f.type === "number" ? "any" : undefined}
        />
      )}
    </Field>
  );
}

export function SectionForm({ sectionKey, fields, values }: { sectionKey: string; fields: FieldDef[]; values: Record<string, FieldValue> }) {
  const groups = groupFields(fields);
  return (
    <ActionForm action={saveSectionAction} className="space-y-8">
      {(state) => (
        <>
          <input type="hidden" name="_section" value={sectionKey} />
          {groups.map((g, gi) =>
            g.title ? (
              <fieldset key={gi} className="space-y-5 rounded-2xl border border-borde p-5 sm:p-6">
                <legend className="px-2 font-serif text-lg text-tinta">{g.title}</legend>
                {g.fields.map((f) => (
                  <FieldControl key={f.name} f={f} value={values[f.name]} state={state} />
                ))}
              </fieldset>
            ) : (
              <div key={gi} className="space-y-5">
                {g.fields.map((f) => (
                  <FieldControl key={f.name} f={f} value={values[f.name]} state={state} />
                ))}
              </div>
            ),
          )}
          <div className="sticky bottom-0 -mx-5 flex justify-end border-t border-borde bg-papel/95 px-5 py-4 backdrop-blur sm:-mx-8 sm:px-8">
            <SubmitButton pendingText="Publicando…">Guardar y publicar</SubmitButton>
          </div>
        </>
      )}
    </ActionForm>
  );
}
