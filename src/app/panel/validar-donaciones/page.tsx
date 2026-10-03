import Link from "next/link";
import { FileText } from "lucide-react";
import { requireRole } from "@/modules/auth/session";
import { listDonations } from "@/modules/donations/service";
import { DonationReviewActions } from "@/modules/donations/components/review-actions";
import { MessageVisibilityButton } from "@/modules/donations/components/message-visibility";
import { Badge } from "@/shared/ui/badge";
import { receiptSignedUrl } from "@/shared/lib/storage";
import { PageHeader } from "@/shared/ui/page-header";
import { Card } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { Table, Td, Th } from "@/shared/ui/table";
import { DonationStatusBadge, METHOD_LABEL } from "@/shared/ui/status-badges";
import { cn, formatBs, formatDateTime, formatNumber } from "@/shared/lib/utils";
import type { DonationStatus } from "@/generated/prisma/enums";

export const metadata = { title: "Validar donaciones" };

const FILTERS: { value: string; label: string }[] = [
  { value: "PENDING", label: "Pendientes" },
  { value: "APPROVED", label: "Aprobadas" },
  { value: "REJECTED", label: "Rechazadas" },
  { value: "todas", label: "Todas" },
];

export default async function ValidarDonacionesPage({ searchParams }: PageProps<"/panel/validar-donaciones">) {
  await requireRole("SUPERVISOR", "ADMIN");
  const { estado } = await searchParams;
  const filter = typeof estado === "string" && FILTERS.some((f) => f.value === estado) ? estado : "PENDING";
  const donations = await listDonations({ status: filter === "todas" ? undefined : (filter as DonationStatus) });
  const receipts = await Promise.all(donations.map((d) => (d.receiptPath ? receiptSignedUrl(d.receiptPath) : null)));

  return (
    <>
      <PageHeader title="Validar donaciones" description="Revisa el comprobante, confirma el ingreso en la cuenta y aprueba para acreditar los puntos." />

      <nav aria-label="Filtrar por estado" className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value === "PENDING" ? "/panel/validar-donaciones" : `/panel/validar-donaciones?estado=${f.value}`}
            aria-current={filter === f.value ? "page" : undefined}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-semibold transition",
              filter === f.value ? "bg-noche text-white" : "bg-papel text-tinta-suave ring-1 ring-borde hover:text-tinta",
            )}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      <Card>
        {donations.length === 0 ? (
          <EmptyState title={filter === "PENDING" ? "Todo al día" : "Sin resultados"} description={filter === "PENDING" ? "No hay donaciones esperando validación." : undefined} />
        ) : (
          <Table className="min-w-[860px]">
            <thead>
              <tr>
                <Th>Donante</Th>
                <Th>Monto</Th>
                <Th>Detalle</Th>
                <Th>Comprobante</Th>
                <Th>Estado</Th>
                <Th className="text-right">Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {donations.map((d, i) => {
                const donor = d.profile?.fullName ?? d.donorName ?? "Anónimo";
                return (
                  <tr key={d.id} className="align-top">
                    <Td>
                      <p className="font-semibold">{donor}</p>
                      <p className="text-xs text-tinta-suave">{d.profile?.email ?? "sin cuenta"}</p>
                      <p className="text-xs text-tinta-suave">{formatDateTime(d.createdAt)}</p>
                    </Td>
                    <Td className="font-semibold whitespace-nowrap tabular-nums">{formatBs(d.amount)}</Td>
                    <Td className="max-w-64">
                      <p>{d.project?.name ?? "Fondo general"}</p>
                      <p className="text-xs text-tinta-suave">
                        {METHOD_LABEL[d.method]}
                        {d.reference ? ` · Ref. ${d.reference}` : ""}
                      </p>
                      {(d.isAnonymous || d.isRecurring || d.event) && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {d.isAnonymous && <Badge>Anónima</Badge>}
                          {d.isRecurring && <Badge tone="lavanda">Mensual</Badge>}
                          {d.event && <Badge tone="rosa">{d.event.title}</Badge>}
                        </div>
                      )}
                      {d.note && <p className="mt-1 line-clamp-2 text-xs text-tinta-suave italic">Nota: “{d.note}”</p>}
                      {d.message && (
                        <div className="mt-1.5 rounded-lg bg-rosa-50 p-2">
                          <p className={cn("line-clamp-3 text-xs text-tinta", d.messageHidden && "line-through opacity-60")}>💬 “{d.message}”</p>
                          <div className="mt-1">
                            <MessageVisibilityButton id={d.id} hidden={d.messageHidden} />
                          </div>
                        </div>
                      )}
                    </Td>
                    <Td>
                      {receipts[i] ? (
                        <a href={receipts[i]!} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-lavanda-700 hover:underline">
                          <FileText className="size-4" aria-hidden /> Ver
                        </a>
                      ) : (
                        <span className="text-xs text-tinta-suave">—</span>
                      )}
                    </Td>
                    <Td>
                      <DonationStatusBadge status={d.status} />
                      {d.status === "APPROVED" && d.pointsAwarded > 0 && <p className="mt-1 text-xs text-exito">+{formatNumber(d.pointsAwarded)} pts</p>}
                      {d.validatedBy && <p className="mt-1 text-xs text-tinta-suave">por {d.validatedBy.fullName}</p>}
                      {d.rejectionReason && <p className="mt-1 max-w-48 text-xs text-error">{d.rejectionReason}</p>}
                    </Td>
                    <Td className="text-right">
                      {d.status === "PENDING" ? <DonationReviewActions id={d.id} summary={`${formatBs(d.amount)} de ${donor}`} /> : <span className="text-xs text-tinta-suave">—</span>}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>
    </>
  );
}
