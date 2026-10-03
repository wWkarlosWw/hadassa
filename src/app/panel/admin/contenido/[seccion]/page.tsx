import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { requireRole } from "@/modules/auth/session";
import { SITE_SECTIONS, isSectionKey, type FieldDef, type FieldValue } from "@/modules/cms/definitions";
import { getSection } from "@/modules/cms/service";
import { SectionForm } from "@/modules/cms/components/section-form";
import { PageHeader } from "@/shared/ui/page-header";
import { Card, CardBody } from "@/shared/ui/card";
import { LinkButton } from "@/shared/ui/button";


export async function generateMetadata({ params }: PageProps<"/panel/admin/contenido/[seccion]">) {
  const { seccion } = await params;
  return { title: isSectionKey(seccion) ? `Contenido: ${SITE_SECTIONS[seccion].title}` : "Contenido" };
}

export default async function SeccionPage({ params }: PageProps<"/panel/admin/contenido/[seccion]">) {
  await requireRole("ADMIN");
  const { seccion } = await params;
  if (!isSectionKey(seccion)) notFound();
  const def = SITE_SECTIONS[seccion];
  const values = (await getSection(seccion)) as Record<string, FieldValue>;
  const preview = "preview" in def ? def.preview : undefined;

  return (
    <>
      <Link href="/panel/admin/contenido" className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-tinta-suave hover:text-tinta">
        <ArrowLeft className="size-4" aria-hidden /> Contenido
      </Link>
      <PageHeader
        title={def.title}
        description={def.description}
        actions={
          preview ? (
            <LinkButton href={preview} target="_blank" variant="outline" size="sm">
              <ExternalLink className="size-4" aria-hidden /> Ver en el sitio
            </LinkButton>
          ) : undefined
        }
      />
      <Card className="max-w-3xl">
        <CardBody className="pb-0 sm:px-8 sm:pt-8">
          <SectionForm sectionKey={seccion} fields={[...(def.fields as readonly FieldDef[])]} values={values} />
        </CardBody>
      </Card>
    </>
  );
}
