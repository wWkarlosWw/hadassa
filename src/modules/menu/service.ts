import "server-only";
import { cache } from "react";
import { prisma } from "@/shared/lib/prisma";
import { DomainError } from "@/shared/lib/action-result";
import type { MenuLocation } from "@/generated/prisma/client";
import { listPublishedPages } from "@/modules/pages/service";
import { DEFAULT_MENU, type MenuItemInput } from "./schemas";

export interface PublicLink {
  href: string;
  label: string;
  newTab: boolean;
}

export const listMenuItems = () =>
  prisma.menuItem.findMany({ orderBy: [{ location: "asc" }, { sortOrder: "asc" }] });

/**
 * Enlaces visibles de una ubicación + páginas publicadas marcadas para esa
 * ubicación. Si aún no hay enlaces configurados, usa los de por defecto.
 */
export const getMenu = cache(async (location: MenuLocation): Promise<PublicLink[]> => {
  let items: PublicLink[];
  let pages: Awaited<ReturnType<typeof listPublishedPages>> = [];
  try {
    const [rows, total, published] = await Promise.all([
      prisma.menuItem.findMany({ where: { location, isVisible: true }, orderBy: { sortOrder: "asc" } }),
      prisma.menuItem.count({ where: { location } }),
      listPublishedPages(),
    ]);
    pages = published;
    items =
      total === 0
        ? DEFAULT_MENU.filter((m) => m.location === location).map((m) => ({ href: m.href, label: m.label, newTab: false }))
        : rows.map((r) => ({ href: r.href, label: r.label, newTab: r.openInNewTab }));
  } catch {
    items = DEFAULT_MENU.filter((m) => m.location === location).map((m) => ({ href: m.href, label: m.label, newTab: false }));
  }
  const seen = new Set(items.map((i) => i.href));
  for (const p of pages) {
    const wanted = location === "HEADER" ? p.showInNav : p.showInFooter;
    const href = `/${p.slug}`;
    if (wanted && !seen.has(href)) {
      items.push({ href, label: p.title, newTab: false });
      seen.add(href);
    }
  }
  return items;
});

export async function saveMenuItem(input: MenuItemInput) {
  const { id, ...data } = input;
  if (id) return prisma.menuItem.update({ where: { id }, data });
  const last = await prisma.menuItem.findFirst({ where: { location: data.location }, orderBy: { sortOrder: "desc" } });
  return prisma.menuItem.create({ data: { ...data, sortOrder: data.sortOrder || (last?.sortOrder ?? -1) + 1 } });
}

export const deleteMenuItem = (id: string) => prisma.menuItem.delete({ where: { id } });

export const setMenuItemVisible = (id: string, isVisible: boolean) =>
  prisma.menuItem.update({ where: { id }, data: { isVisible } });

/** Mueve un enlace una posición arriba/abajo dentro de su ubicación. */
export async function moveMenuItem(id: string, direction: "up" | "down") {
  await prisma.$transaction(async (tx) => {
    const item = await tx.menuItem.findUnique({ where: { id } });
    if (!item) throw new DomainError("Enlace no encontrado.");
    const siblings = await tx.menuItem.findMany({ where: { location: item.location }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
    const index = siblings.findIndex((s) => s.id === id);
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= siblings.length) return;
    [siblings[index], siblings[target]] = [siblings[target], siblings[index]];
    // Renumera para evitar empates en sortOrder.
    await Promise.all(siblings.map((s, i) => tx.menuItem.update({ where: { id: s.id }, data: { sortOrder: i } })));
  });
}

/** Crea los enlaces por defecto si la tabla está vacía (seed / primera visita del admin). */
export async function ensureDefaultMenu() {
  if ((await prisma.menuItem.count()) > 0) return;
  const counters = { HEADER: 0, FOOTER: 0 };
  await prisma.menuItem.createMany({
    data: DEFAULT_MENU.map((m) => ({ ...m, sortOrder: counters[m.location]++ })),
  });
}
