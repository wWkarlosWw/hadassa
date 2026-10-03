import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { requireRole } from "@/modules/auth/session";
import { SECTION_KEYS, SITE_SECTIONS } from "@/modules/cms/definitions";
import { PageHeader } from "@/shared/ui/page-header";

export const metadata = { title: "Contenido del sitio" };

export default async function ContenidoPage() {
  await requireRole("ADMIN");
  return (
    <>
      <PageHeader title="Contenido del sitio" description="Edita los títulos, textos, imágenes y datos que se muestran en la web pública. Los cambios se publican al guardar." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {SECTION_KEYS.map((key) => {
          const s = SITE_SECTIONS[key];
          return (
            <Link
              key={key}
              href={`/panel/admin/contenido/${key}`}
              className="group flex flex-col rounded-[var(--radius-card)] border border-borde bg-papel p-5 shadow-[var(--shadow-suave)] transition hover:-translate-y-0.5 hover:border-rosa"
            >
              <h2 className="font-serif text-xl">{s.title}</h2>
              <p className="mt-1 flex-1 text-sm text-tinta-suave">{s.description}</p>
              <p className="mt-4 flex items-center justify-between text-xs font-semibold text-lavanda-700">
                {s.fields.length} campos {"preview" in s && s.preview ? `· ${s.preview}` : ""}
                <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden />
              </p>
            </Link>
          );
        })}
        <Link href="/panel/admin/valores" className="flex flex-col rounded-[var(--radius-card)] border border-dashed border-borde p-5 transition hover:border-rosa hover:bg-papel">
          <h2 className="font-serif text-xl">Valores</h2>
          <p className="mt-1 text-sm text-tinta-suave">Los frutos del árbol de mirto.</p>
        </Link>
        <Link href="/panel/admin/organigrama" className="flex flex-col rounded-[var(--radius-card)] border border-dashed border-borde p-5 transition hover:border-rosa hover:bg-papel">
          <h2 className="font-serif text-xl">Organigrama</h2>
          <p className="mt-1 text-sm text-tinta-suave">Áreas de la fundación.</p>
        </Link>
        <Link href="/panel/admin/proyectos" className="flex flex-col rounded-[var(--radius-card)] border border-dashed border-borde p-5 transition hover:border-rosa hover:bg-papel">
          <h2 className="font-serif text-xl">Proyectos</h2>
          <p className="mt-1 text-sm text-tinta-suave">Las tarjetas-puerta del inicio.</p>
        </Link>
      </div>
    </>
  );
}
