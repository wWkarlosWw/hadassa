import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { listPublicProjects } from "@/modules/projects/service";
import { listPublishedPages } from "@/modules/pages/service";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const statics = ["", "/nosotros", "/proyectos", "/casa-de-fruto", "/donar", "/actividades", "/contacto"].map((p) => ({
    url: `${base}${p}`,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.7,
  }));
  let projects: MetadataRoute.Sitemap = [];
  try {
    projects = (await listPublicProjects())
      .filter((p) => p.slug !== "casa-de-fruto")
      .map((p) => ({ url: `${base}/proyectos/${p.slug}`, lastModified: p.updatedAt, priority: 0.6 }));
  } catch {
    // Sin base de datos: solo rutas estáticas.
  }
  let pages: MetadataRoute.Sitemap = [];
  try {
    pages = (await listPublishedPages()).map((p) => ({ url: `${base}/${p.slug}`, lastModified: p.updatedAt, priority: 0.5 }));
  } catch {
    // Sin base de datos.
  }
  return [...statics, ...projects, ...pages];
}
