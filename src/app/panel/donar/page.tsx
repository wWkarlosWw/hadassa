import { redirect } from "next/navigation";
import { requireUser } from "@/modules/auth/session";
import { getSection } from "@/modules/cms/service";
import { listPublicProjects } from "@/modules/projects/service";
import { listUpcomingEvents } from "@/modules/events/service";
import { DonationForm } from "@/modules/donations/components/donation-form";
import { BankInfo } from "@/modules/donations/components/bank-info";
import { PageHeader } from "@/shared/ui/page-header";
import { Card, CardBody } from "@/shared/ui/card";
import { formatNumber } from "@/shared/lib/utils";

export const metadata = { title: "Donar" };

export default async function DonarPage({ searchParams }: PageProps<"/panel/donar">) {
  await requireUser();
  const { proyecto } = await searchParams;
  const [donation, gamification, projects, events] = await Promise.all([
    getSection("donation"),
    getSection("gamification"),
    listPublicProjects(),
    listUpcomingEvents(30),
  ]);
  // Con una campaña elegida, usamos el flujo de donación paso a paso.
  const chosen = projects.find((p) => p.slug === proyecto);
  if (chosen?.acceptsDonations) redirect(`/donar/${chosen.slug}`);
  const defaultProjectId = chosen?.id;

  return (
    <>
      <PageHeader
        title="Registrar mi donación"
        description="Dona por QR o transferencia y registra tu aporte aquí para sumar puntos y canjearlos por recompensas de nuestros aliados."
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card>
          <CardBody className="sm:p-8">
            <DonationForm
              projects={projects.filter((p) => p.acceptsDonations).map((p) => ({ id: p.id, name: p.name, color: p.color }))}
              events={events.map((e) => ({ id: e.id, title: e.title }))}
              defaultProjectId={defaultProjectId}
              pointsPerBoliviano={gamification.pointsPerBoliviano}
              minDonation={gamification.minDonation}
            />
          </CardBody>
        </Card>
        <aside className="space-y-4">
          <ol className="space-y-3 rounded-[var(--radius-card)] border border-borde bg-papel p-5 text-sm shadow-[var(--shadow-suave)]">
            {["Escanea el QR o transfiere a la cuenta.", "Registra el monto y adjunta tu comprobante.", "Validamos tu aporte y sumas tus puntos."].map((t, i) => (
              <li key={t} className="flex gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-lavanda-50 text-xs font-bold text-lavanda-700">{i + 1}</span>
                <span className="text-tinta-suave">{t}</span>
              </li>
            ))}
            <li className="border-t border-borde pt-3 text-xs text-tinta-suave">
              Cada Bs. 1 donado = <strong className="text-vino">{formatNumber(gamification.pointsPerBoliviano)} puntos</strong>.
            </li>
          </ol>
          <BankInfo content={donation} />
        </aside>
      </div>
    </>
  );
}
