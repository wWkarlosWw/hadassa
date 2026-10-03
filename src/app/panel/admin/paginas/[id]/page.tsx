import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { z } from "zod";
import { requireRole } from "@/modules/auth/session";
import { getPage } from "@/modules/pages/service";
import { PageForm } from "@/modules/pages/components/page-form";
import { PageHeader } from "@/shared/ui/page-header";
import { Card, CardBody } from "@/shared/ui/card";
import { LinkButton } from "@/shared/ui/button";

export const metadata = { title: "Editar página" };

export default async function EditarPaginaPage(props: PageProps<"/panel/admin/paginas/[id]">) {
  await requireRole("ADMIN");
  const [{ id }, sp] = await Promise.all([props.params, props.searchParams]);
  if (!z.uuid().safeParse(id).success) notFound();
  const page = await getPage(id);
  if (!page) notFound();

  return (
    <>
      <Link href="/panel/admin/paginas" className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-tinta-suave hover:text-tinta">
        <ArrowLeft className="size-4" aria-hidden /> Páginas
      </Link>
      <PageHeader
        title={page.title}
        description={`/${page.slug} · ${page.published ? "Publicada" : "Borrador"}`}
        actions={
          <LinkButton href={`/${page.slug}${page.published ? "" : "?vista-previa=1"}`} target="_blank" variant="outline" size="sm">
            <ExternalLink className="size-4" aria-hidden /> {page.published ? "Ver en el sitio" : "Vista previa"}
          </LinkButton>
        }
      />
      {sp.creada === "1" && (
        <p role="status" className="mb-4 rounded-xl bg-exito-50 px-4 py-3 text-sm font-medium text-exito">
          Página creada.
        </p>
      )}
      <Card>
        <CardBody className="pb-0 sm:px-8 sm:pt-8">
          <PageForm
            page={{
              id: page.id,
              title: page.title,
              slug: page.slug,
              excerpt: page.excerpt,
              coverUrl: page.coverUrl,
              blocks: page.blocks,
              published: page.published,
              showInNav: page.showInNav,
              showInFooter: page.showInFooter,
              sortOrder: page.sortOrder,
              seoTitle: page.seoTitle,
              seoDescription: page.seoDescription,
            }}
          />
        </CardBody>
      </Card>
    </>
  );
}
