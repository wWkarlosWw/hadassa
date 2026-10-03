import "server-only";
import { cache } from "react";
import { prisma } from "@/shared/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type { SectionContent, SectionKey } from "./definitions";
import { coerceSection } from "./coerce";

/** Contenido de una sección (valores guardados + defaults). */
export const getSection = cache(async <K extends SectionKey>(key: K): Promise<SectionContent<K>> => {
  const row = await prisma.siteSetting.findUnique({ where: { key } });
  return coerceSection(key, row?.value);
});

/** Como `getSection`, pero sin base de datos devuelve los valores por defecto (metadatos, build). */
export async function getSectionSafe<K extends SectionKey>(key: K): Promise<SectionContent<K>> {
  try {
    return await getSection(key);
  } catch {
    return coerceSection(key, undefined);
  }
}

export async function saveSection<K extends SectionKey>(key: K, values: Record<string, unknown>) {
  const value = coerceSection(key, values);
  const json = value as unknown as Prisma.InputJsonValue;
  await prisma.siteSetting.upsert({
    where: { key },
    update: { value: json },
    create: { key, value: json },
  });
  return value;
}

// ─── Valores (frutos del árbol) ─────────────────────────────────────────────

export const listCoreValues = cache(async (includeInactive = false) =>
  prisma.coreValue.findMany({
    where: includeInactive ? {} : { isActive: true },
    orderBy: { sortOrder: "asc" },
  }),
);

export async function upsertCoreValue(data: {
  id?: string;
  title: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
}) {
  const { id, ...rest } = data;
  return id
    ? prisma.coreValue.update({ where: { id }, data: rest })
    : prisma.coreValue.create({ data: rest });
}

export const deleteCoreValue = (id: string) => prisma.coreValue.delete({ where: { id } });

// ─── Organigrama ────────────────────────────────────────────────────────────

export const listOrgAreas = cache(async () => prisma.orgArea.findMany({ orderBy: { sortOrder: "asc" } }));

export async function upsertOrgArea(data: {
  id?: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  sortOrder: number;
}) {
  const { id, ...rest } = data;
  return id ? prisma.orgArea.update({ where: { id }, data: rest }) : prisma.orgArea.create({ data: rest });
}

export const deleteOrgArea = (id: string) => prisma.orgArea.delete({ where: { id } });

// ─── Mensajes de contacto ───────────────────────────────────────────────────

export const createContactMessage = (data: { name: string; email: string; phone?: string; message: string }) =>
  prisma.contactMessage.create({ data });

export const listContactMessages = () => prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 200 });

export const setContactMessageRead = (id: string, isRead: boolean) =>
  prisma.contactMessage.update({ where: { id }, data: { isRead } });

export const deleteContactMessage = (id: string) => prisma.contactMessage.delete({ where: { id } });
