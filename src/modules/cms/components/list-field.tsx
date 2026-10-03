"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { MediaPicker } from "@/modules/media/components/media-picker";
import { Button } from "@/shared/ui/button";
import { Input, Textarea } from "@/shared/ui/form";
import type { FieldDef, ListItem } from "../definitions";

/** Editor de listas repetibles: serializa los elementos como JSON en un campo oculto. */
export function ListField({ field, defaultValue, error }: { field: FieldDef; defaultValue: ListItem[]; error?: string[] }) {
  const subFields = field.itemFields ?? [];
  const blank = () => Object.fromEntries(subFields.map((s) => [s.name, ""])) as ListItem;
  const [items, setItems] = useState<ListItem[]>(defaultValue);
  const itemLabel = field.itemLabel ?? "Elemento";

  const update = (i: number, key: string, value: string) =>
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, [key]: value } : it)));
  const move = (i: number, d: -1 | 1) =>
    setItems((prev) => {
      const next = [...prev];
      const j = i + d;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-tinta">{field.label}</span>
        <span className="text-xs text-tinta-suave">{items.length} {items.length === 1 ? itemLabel.toLowerCase() : "elementos"}</span>
      </div>
      {field.help && <p className="text-xs text-tinta-suave">{field.help}</p>}
      <input type="hidden" name={field.name} value={JSON.stringify(items)} />
      <ol className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="rounded-2xl border border-borde bg-crema/50 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold tracking-wide text-tinta-suave uppercase">
                {itemLabel} {i + 1}
              </span>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Subir ${itemLabel} ${i + 1}`}>
                  <ArrowUp className="size-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label={`Bajar ${itemLabel} ${i + 1}`}>
                  <ArrowDown className="size-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setItems((p) => p.filter((_, idx) => idx !== i))} aria-label={`Eliminar ${itemLabel} ${i + 1}`}>
                  <Trash2 className="size-4 text-error" />
                </Button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {subFields.map((sub) => {
                const id = `${field.name}-${i}-${sub.name}`;
                return (
                  <label key={sub.name} htmlFor={id} className={sub.type === "textarea" ? "space-y-1 sm:col-span-2" : "space-y-1"}>
                    <span className="block text-xs font-medium text-tinta-suave">{sub.label}</span>
                    {sub.type === "textarea" ? (
                      <Textarea id={id} value={item[sub.name] ?? ""} onChange={(e) => update(i, sub.name, e.target.value)} rows={3} />
                    ) : (
                      <span className="flex gap-2">
                        <Input id={id} value={item[sub.name] ?? ""} onChange={(e) => update(i, sub.name, e.target.value)} className="h-10" />
                        {sub.type === "image" && <MediaPicker onSelect={(url) => update(i, sub.name, url)} />}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </li>
        ))}
      </ol>
      <Button variant="outline" size="sm" onClick={() => setItems((p) => [...p, blank()])} disabled={items.length >= 50}>
        <Plus className="size-4" aria-hidden /> Agregar {itemLabel.toLowerCase()}
      </Button>
      {error?.[0] && (
        <p className="text-xs font-medium text-error" role="alert">
          {error[0]}
        </p>
      )}
    </div>
  );
}
