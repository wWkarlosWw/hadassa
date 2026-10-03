"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { MediaPicker } from "@/modules/media/components/media-picker";
import { Button } from "@/shared/ui/button";
import { Checkbox, Input, Select, Textarea } from "@/shared/ui/form";
import { BLOCK_LABELS, type Block, type BlockType } from "../schemas";

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `b${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
}

function emptyBlock(type: BlockType): Block {
  const id = newId();
  switch (type) {
    case "heading":
      return { id, type, text: "", level: "2" };
    case "paragraph":
      return { id, type, text: "" };
    case "image":
      return { id, type, url: "", alt: "", caption: "" };
    case "quote":
      return { id, type, text: "", author: "" };
    case "button":
      return { id, type, label: "", href: "", variant: "primary" };
    case "video":
      return { id, type, url: "", title: "" };
    case "columns":
      return { id, type, title: "", text: "", imageUrl: "", imageAlt: "", imageSide: "right" };
    case "spacer":
      return { id, type, size: "md", divider: true };
  }
}

function L({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <label className={wide ? "block space-y-1 sm:col-span-2" : "block space-y-1"}>
      <span className="block text-xs font-medium text-tinta-suave">{label}</span>
      {children}
    </label>
  );
}

function ImageUrl({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <span className="flex gap-2">
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="/images/… o https://…" className="h-10" />
      <MediaPicker onSelect={onChange} />
    </span>
  );
}

function BlockFields({ block, set }: { block: Block; set: (patch: Partial<Block>) => void }) {
  const p = set as (patch: Record<string, unknown>) => void;
  switch (block.type) {
    case "heading":
      return (
        <div className="grid gap-3 sm:grid-cols-[1fr_10rem]">
          <L label="Texto">
            <Input value={block.text} onChange={(e) => p({ text: e.target.value })} />
          </L>
          <L label="Tamaño">
            <Select value={block.level} onChange={(e) => p({ level: e.target.value })}>
              <option value="2">Grande</option>
              <option value="3">Mediano</option>
            </Select>
          </L>
        </div>
      );
    case "paragraph":
      return (
        <L label="Texto (separa párrafos con una línea en blanco)">
          <Textarea value={block.text} onChange={(e) => p({ text: e.target.value })} rows={6} />
        </L>
      );
    case "image":
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <L label="Imagen" wide>
            <ImageUrl value={block.url} onChange={(url) => p({ url })} />
          </L>
          <L label="Descripción (accesibilidad)">
            <Input value={block.alt} onChange={(e) => p({ alt: e.target.value })} />
          </L>
          <L label="Pie de foto (opcional)">
            <Input value={block.caption} onChange={(e) => p({ caption: e.target.value })} />
          </L>
        </div>
      );
    case "quote":
      return (
        <div className="grid gap-3">
          <L label="Cita">
            <Textarea value={block.text} onChange={(e) => p({ text: e.target.value })} rows={3} />
          </L>
          <L label="Autor (opcional)">
            <Input value={block.author} onChange={(e) => p({ author: e.target.value })} />
          </L>
        </div>
      );
    case "button":
      return (
        <div className="grid gap-3 sm:grid-cols-3">
          <L label="Texto">
            <Input value={block.label} onChange={(e) => p({ label: e.target.value })} />
          </L>
          <L label="Enlace (/donar o https://…)">
            <Input value={block.href} onChange={(e) => p({ href: e.target.value })} />
          </L>
          <L label="Estilo">
            <Select value={block.variant} onChange={(e) => p({ variant: e.target.value })}>
              <option value="primary">Lavanda</option>
              <option value="vino">Vino</option>
              <option value="outline">Contorno</option>
            </Select>
          </L>
        </div>
      );
    case "video":
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <L label="URL de YouTube o Vimeo">
            <Input value={block.url} onChange={(e) => p({ url: e.target.value })} />
          </L>
          <L label="Título del video">
            <Input value={block.title} onChange={(e) => p({ title: e.target.value })} />
          </L>
        </div>
      );
    case "columns":
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <L label="Título (opcional)" wide>
            <Input value={block.title} onChange={(e) => p({ title: e.target.value })} />
          </L>
          <L label="Texto" wide>
            <Textarea value={block.text} onChange={(e) => p({ text: e.target.value })} rows={5} />
          </L>
          <L label="Imagen" wide>
            <ImageUrl value={block.imageUrl} onChange={(imageUrl) => p({ imageUrl })} />
          </L>
          <L label="Descripción de la imagen">
            <Input value={block.imageAlt} onChange={(e) => p({ imageAlt: e.target.value })} />
          </L>
          <L label="Imagen a la">
            <Select value={block.imageSide} onChange={(e) => p({ imageSide: e.target.value })}>
              <option value="right">Derecha</option>
              <option value="left">Izquierda</option>
            </Select>
          </L>
        </div>
      );
    case "spacer":
      return (
        <div className="flex flex-wrap items-end gap-4">
          <L label="Espacio">
            <Select value={block.size} onChange={(e) => p({ size: e.target.value })}>
              <option value="sm">Pequeño</option>
              <option value="md">Mediano</option>
              <option value="lg">Grande</option>
            </Select>
          </L>
          <Checkbox label="Mostrar línea divisoria" checked={block.divider} onChange={(e) => p({ divider: e.target.checked })} />
        </div>
      );
  }
}

/** Editor por bloques: serializa los bloques como JSON en el campo oculto `blocks`. */
export function BlockEditor({ defaultValue, error }: { defaultValue: Block[]; error?: string[] }) {
  const [blocks, setBlocks] = useState<Block[]>(defaultValue);
  const [newType, setNewType] = useState<BlockType>("paragraph");

  const update = (i: number, patch: Partial<Block>) =>
    setBlocks((prev) => prev.map((b, idx) => (idx === i ? ({ ...b, ...patch } as Block) : b)));
  const move = (i: number, d: -1 | 1) =>
    setBlocks((prev) => {
      const j = i + d;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  return (
    <div className="space-y-4">
      <input type="hidden" name="blocks" value={JSON.stringify(blocks)} />
      {blocks.length === 0 && (
        <p className="rounded-2xl border border-dashed border-borde px-4 py-8 text-center text-sm text-tinta-suave">
          Aún no hay contenido. Agrega tu primer bloque.
        </p>
      )}
      <ol className="space-y-3">
        {blocks.map((b, i) => (
          <li key={b.id} className="rounded-2xl border border-borde bg-papel p-4 shadow-[var(--shadow-suave)]">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="rounded-full bg-lavanda-50 px-3 py-1 text-xs font-semibold text-lavanda-700">
                {i + 1}. {BLOCK_LABELS[b.type]}
              </span>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Subir bloque ${i + 1}`}>
                  <ArrowUp className="size-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => move(i, 1)} disabled={i === blocks.length - 1} aria-label={`Bajar bloque ${i + 1}`}>
                  <ArrowDown className="size-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setBlocks((prev) => prev.filter((_, idx) => idx !== i))} aria-label={`Eliminar bloque ${i + 1}`}>
                  <Trash2 className="size-4 text-error" />
                </Button>
              </div>
            </div>
            <BlockFields block={b} set={(patch) => update(i, patch)} />
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-crema p-3">
        <label htmlFor="new-block" className="text-sm font-medium text-tinta">
          Agregar bloque:
        </label>
        <Select id="new-block" value={newType} onChange={(e) => setNewType(e.target.value as BlockType)} className="h-10 w-auto">
          {(Object.keys(BLOCK_LABELS) as BlockType[]).map((t) => (
            <option key={t} value={t}>
              {BLOCK_LABELS[t]}
            </option>
          ))}
        </Select>
        <Button variant="outline" size="sm" onClick={() => setBlocks((prev) => [...prev, emptyBlock(newType)])} disabled={blocks.length >= 100}>
          <Plus className="size-4" aria-hidden /> Agregar
        </Button>
      </div>
      {error?.[0] && (
        <p className="text-xs font-medium text-error" role="alert">
          {error[0]}
        </p>
      )}
    </div>
  );
}
