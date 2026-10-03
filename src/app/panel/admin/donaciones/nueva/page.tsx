import { requireRole } from "@/modules/auth/session";
import { listAllProjects } from "@/modules/projects/service";
import { listAllEvents } from "@/modules/events/service";
import { OfflineDonationForm } from "@/modules/donations/components/offline-donation-form";
import { PageHeader } from "@/shared/ui/page-header";
import { Card, CardBody } from "@/shared/ui/card";

export const metadata = { title: "Registrar donación" };

export default async function NuevaDonacionPage() {
  await requireRole("ADMIN");
  const [projects, events] = await Promise.all([listAllProjects(), listAllEvents()]);
  return (
    <>
      <PageHeader
        title="Registrar donación recibida"
        description="Para aportes en efectivo, depósitos o cualquier ingreso que no se registró desde la web. Se aprueba al instante."
      />
      <Card className="max-w-3xl">
        <CardBody className="sm:p-8">
          <OfflineDonationForm
            projects={projects.filter((p) => p.isActive).map((p) => ({ id: p.id, name: p.name }))}
            events={events.filter((e) => e.isActive).map((e) => ({ id: e.id, title: e.title }))}
          />
        </CardBody>
      </Card>
    </>
  );
}
