import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/modules/auth/session";
import { PageForm } from "@/modules/pages/components/page-form";
import { PageHeader } from "@/shared/ui/page-header";
import { Card, CardBody } from "@/shared/ui/card";

export const metadata = { title: "Nueva página" };

export default async function NuevaPaginaPage() {
  await requireRole("ADMIN");
  return (
    <>
      <Link href="/panel/admin/paginas" className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-tinta-suave hover:text-tinta">
        <ArrowLeft className="size-4" aria-hidden /> Páginas
      </Link>
      <PageHeader title="Nueva página" />
      <Card>
        <CardBody className="pb-0 sm:px-8 sm:pt-8">
          <PageForm />
        </CardBody>
      </Card>
    </>
  );
}
