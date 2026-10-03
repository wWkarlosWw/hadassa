"use client";

import { ActionForm, fieldError } from "@/modules/panel/action-form";
import { ImageInput } from "@/modules/panel/image-input";
import { Checkbox, Field, Input, Textarea } from "@/shared/ui/form";
import { SubmitButton } from "@/shared/ui/submit-button";
import { savePageAction } from "../actions";
import type { Block } from "../schemas";
import { BlockEditor } from "./block-editor";

export interface PageFormValues {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  coverUrl: string | null;
  blocks: Block[];
  published: boolean;
  showInNav: boolean;
  showInFooter: boolean;
  sortOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
}

export function PageForm({ page }: { page?: PageFormValues }) {
  return (
    <ActionForm action={savePageAction} className="space-y-8">
      {(state) => {
        const fe = (n: string) => fieldError(state, n);
        // Errores dentro de un bloque llegan como "blocks.3.href".
        const blockErrors = state && !state.ok ? Object.entries(state.fieldErrors ?? {}).filter(([k]) => k.startsWith("blocks")) : [];
        return (
          <>
            {page?.id && <input type="hidden" name="id" value={page.id} />}
            <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Título" htmlFor="p-title" error={fe("title")} className="sm:col-span-2">
                    <Input id="p-title" name="title" defaultValue={page?.title} required />
                  </Field>
                  <Field label="Dirección (slug)" htmlFor="p-slug" error={fe("slug")} help="Se genera del título si lo dejas vacío. Ej.: transparencia → /transparencia">
                    <Input id="p-slug" name="slug" defaultValue={page?.slug} placeholder="transparencia" />
                  </Field>
                  <Field label="Orden" htmlFor="p-order" error={fe("sortOrder")}>
                    <Input id="p-order" name="sortOrder" type="number" defaultValue={page?.sortOrder ?? 0} />
                  </Field>
                  <Field label="Resumen (bajo el título)" htmlFor="p-excerpt" error={fe("excerpt")} className="sm:col-span-2">
                    <Textarea id="p-excerpt" name="excerpt" defaultValue={page?.excerpt} rows={2} />
                  </Field>
                </div>
                <div>
                  <h2 className="mb-3 font-serif text-xl">Contenido</h2>
                  <BlockEditor
                    defaultValue={page?.blocks ?? []}
                    error={blockErrors.length ? [`Bloque ${Number(blockErrors[0][0].split(".")[1]) + 1}: ${blockErrors[0][1][0]}`] : fe("blocks")}
                  />
                </div>
              </div>
              <aside className="space-y-6">
                <fieldset className="space-y-3 rounded-2xl border border-borde p-5">
                  <legend className="px-2 font-serif text-lg">Publicación</legend>
                  <Checkbox name="published" label="Publicada" defaultChecked={page?.published} />
                  <Checkbox name="showInNav" label="Mostrar en el menú principal" defaultChecked={page?.showInNav} />
                  <Checkbox name="showInFooter" label="Mostrar en el pie de página" defaultChecked={page?.showInFooter} />
                </fieldset>
                <ImageInput name="coverUrl" label="Imagen de portada (opcional)" defaultValue={page?.coverUrl} />
                <fieldset className="space-y-4 rounded-2xl border border-borde p-5">
                  <legend className="px-2 font-serif text-lg">SEO</legend>
                  <Field label="Título para buscadores" htmlFor="p-seo-title" error={fe("seoTitle")}>
                    <Input id="p-seo-title" name="seoTitle" defaultValue={page?.seoTitle ?? ""} />
                  </Field>
                  <Field label="Descripción para buscadores" htmlFor="p-seo-desc" error={fe("seoDescription")}>
                    <Textarea id="p-seo-desc" name="seoDescription" defaultValue={page?.seoDescription ?? ""} rows={3} />
                  </Field>
                </fieldset>
              </aside>
            </div>
            <div className="sticky bottom-0 -mx-5 flex justify-end border-t border-borde bg-papel/95 px-5 py-4 backdrop-blur sm:-mx-8 sm:px-8">
              <SubmitButton pendingText="Guardando…">Guardar página</SubmitButton>
            </div>
          </>
        );
      }}
    </ActionForm>
  );
}
