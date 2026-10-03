import { requireUser } from "@/modules/auth/session";
import { listDonations } from "@/modules/donations/service";
import { Badge } from "@/shared/ui/badge";
import { PageHeader } from "@/shared/ui/page-header";
import { Card } from "@/shared/ui/card";
import { LinkButton } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { Table, Td, Th } from "@/shared/ui/table";
import { DonationStatusBadge, METHOD_LABEL } from "@/shared/ui/status-badges";
import { formatBs, formatDate, formatNumber } from "@/shared/lib/utils";

export const metadata = { title: "Mis donaciones" };

export default async function MisDonacionesPage() {
  const user = await requireUser();
  const donations = await listDonations({ profileId: user.id });
  const approved = donations.filter((d) => d.status === "APPROVED");
  const total = approved.reduce((s, d) => s + d.amount, 0);

  return (
    <>
      <PageHeader
        title="Mis donaciones"
        description={donations.length ? `Has aportado ${formatBs(total)} en ${approved.length} donaciones aprobadas. ¡Gracias!` : undefined}
        actions={<LinkButton href="/panel/donar">Nueva donación</LinkButton>}
      />
      <Card>
        {donations.length === 0 ? (
          <EmptyState title="Aún no registras donaciones" description="Cuando dones por QR o transferencia, regístralo aquí para sumar puntos." action={<LinkButton href="/panel/donar" size="sm">Donar ahora</LinkButton>} />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Fecha</Th>
                <Th>Monto</Th>
                <Th>Proyecto</Th>
                <Th>Medio</Th>
                <Th>Estado</Th>
                <Th className="text-right">Puntos</Th>
              </tr>
            </thead>
            <tbody>
              {donations.map((d) => (
                <tr key={d.id}>
                  <Td className="whitespace-nowrap text-tinta-suave">{formatDate(d.createdAt)}</Td>
                  <Td className="font-semibold tabular-nums">{formatBs(d.amount)}</Td>
                  <Td>
                    <span className="flex items-center gap-2">
                      <span className="size-2 rounded-full" style={{ background: d.project?.color ?? "#d8cfcf" }} aria-hidden />
                      {d.project?.name ?? "Fondo general"}
                    </span>
                    {d.event && <span className="block text-xs text-tinta-suave">{d.event.title}</span>}
                    {(d.isAnonymous || d.isRecurring) && (
                      <span className="mt-1 flex flex-wrap gap-1">
                        {d.isAnonymous && <Badge>Anónima</Badge>}
                        {d.isRecurring && <Badge tone="lavanda">Mensual</Badge>}
                      </span>
                    )}
                    {d.message && (
                      <span className="mt-1 block max-w-64 text-xs text-tinta-suave italic">
                        “{d.message}”{d.messageHidden ? " (no publicado)" : ""}
                      </span>
                    )}
                  </Td>
                  <Td className="text-tinta-suave">{METHOD_LABEL[d.method]}</Td>
                  <Td>
                    <DonationStatusBadge status={d.status} />
                    {d.status === "REJECTED" && d.rejectionReason && <p className="mt-1 max-w-56 text-xs text-error">{d.rejectionReason}</p>}
                  </Td>
                  <Td className="text-right font-semibold text-exito tabular-nums">{d.pointsAwarded > 0 ? `+${formatNumber(d.pointsAwarded)}` : "—"}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </>
  );
}
