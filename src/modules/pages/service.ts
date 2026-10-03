import "server-only";
import { cache } from "react";
import { prisma } from "@/shared/lib/prisma";
import { DomainError } from "@/shared/lib/action-result";
import { slugify } from "@/shared/lib/utils";
import type { Page, Prisma } from "@/generated/prisma/client";
import { isReservedSlug, parseStoredBlocks, type PageInput } from "./schemas";

function toDto(p: Page) {
  return { ...p, blocks: parseStoredBlocks(p.blocks) };
}
export type PageDto = ReturnType<typeof toDto>;

export async function listPages() {
  const rows = await prisma.page.findMany({ orderBy: [{ sortOrder: "asc" }, { title: "asc" }] });
  return rows.map(toDto);
}

export const listPublishedPages = cache(async () =>
  prisma.page.findMany({
    where: { published: true },
    select: { slug: true, title: true, showInNav: true, showInFooter: true, updatedAt: true },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  }),
);

export async function getPage(id: string) {
  const row = await prisma.page.findUnique({ where: { id } });
  return row ? toDto(row) : null;
}

/** Página pública por slug (solo publicadas, salvo vista previa de admin). */
export const getPageBySlug = cache(async (slug: string, includeDrafts = false) => {
  const row = await prisma.page.findUnique({ where: { slug } });
  if (!row || (!row.published && !includeDrafts)) return null;
  return toDto(row);
});

export async function savePage(input: PageInput) {
  const { id, slug, blocks, ...data } = input;
  const finalSlug = slugify(slug || data.title);
  if (!finalSlug) throw new DomainError("No se pudo generar la dirección de la página.");
  if (isReservedSlug(finalSlug)) throw new DomainError(`La dirección «/${finalSlug}» está reservada por el sitio.`);

  const clash = await prisma.page.findFirst({ where: { slug: finalSlug, NOT: id ? { id } : undefined } });
  if (clash) throw new DomainError("Ya existe una página con esa dirección.");

  const payload = {
    ...data,
    slug: finalSlug,
    coverUrl: data.coverUrl || null,
    blocks: blocks as unknown as Prisma.InputJsonValue,
  };
  return id ? prisma.page.update({ where: { id }, data: payload }) : prisma.page.create({ data: payload });
}

export const setPagePublished = (id: string, published: boolean) =>
  prisma.page.update({ where: { id }, data: { published } });

export const deletePage = (id: string) => prisma.page.delete({ where: { id } });
