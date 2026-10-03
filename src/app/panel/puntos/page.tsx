import { requireUser } from "@/modules/auth/session";
import { getHistory, getTotalEarned } from "@/modules/points/service";
import { LEVELS, levelFor } from "@/modules/points/rules";
import { ProgressBar } from "@/modules/panel/progress";
import { PageHeader } from "@/shared/ui/page-header";
import { Card, CardBody, CardHeader } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { Table, Td, Th } from "@/shared/ui/table";
import { Badge, type BadgeTone } from "@/shared/ui/badge";
import { cn, formatDateTime, formatNumber } from "@/shared/lib/utils";

export const metadata = { title: "Mis puntos" };

const REASON: Record<string, [string, BadgeTone]> = {
  DONATION: ["Donación", "rosa"],
  ATTENDANCE: ["Asistencia", "lavanda"],
  REDEMPTION: ["Canje", "vino"],
  REFUND: ["Devolución", "neutral"],
  ADJUSTMENT: ["Ajuste", "alerta"],
};

export default async function PuntosPage() {
  const user = await requireUser();
  const [history, totalEarned] = await Promise.all([getHistory(user.id, 200), getTotalEarned(user.id)]);
  const level = levelFor(totalEarned);

  return (
    <>
      <PageHeader title="Mis puntos" description="Cada donación aprobada y cada asistencia suma. Tu nivel crece con todo lo que has sembrado." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardBody className="space-y-5">
            <div>
              <p className="text-sm text-tinta-suave">Saldo disponible</p>
              <p className="font-serif text-4xl tabular-nums">{formatNumber(user.points)}</p>
            </div>
            <div>
              <p className="text-sm text-tinta-suave">Total acumulado</p>
              <p className="font-serif text-2xl tabular-nums">{formatNumber(totalEarned)}</p>
            </div>
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-semibold" style={{ color: level.current.color }}>{level.current.name}</span>
                {level.next && <span className="text-tinta-suave">{level.next.name}</span>}
              </div>
              <ProgressBar value={level.progress} color={level.current.color} label="Progreso de nivel" />
            </div>
            <ol className="space-y-2 border-t border-borde pt-4">
              {LEVELS.map((l) => (
                <li key={l.name} className={cn("flex items-center justify-between text-sm", totalEarned >= l.min ? "text-tinta" : "text-tinta-suave/70")}>
                  <span className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full" style={{ background: l.color, opacity: totalEarned >= l.min ? 1 : 0.35 }} aria-hidden />
                    {l.name}
                  </span>
                  <span className="text-xs tabular-nums">{formatNumber(l.min)} pts</span>
                </li>
              ))}
            </ol>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Historial" />
          {history.length === 0 ? (
            <EmptyState title="Sin movimientos todavía" />
          ) : (
            <Table className="min-w-[520px]">
              <thead>
                <tr>
                  <Th>Fecha</Th>
                  <Th>Concepto</Th>
                  <Th>Tipo</Th>
                  <Th className="text-right">Puntos</Th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => {
                  const [label, tone] = REASON[h.reason] ?? [h.reason, "neutral"];
                  return (
                    <tr key={h.id}>
                      <Td className="whitespace-nowrap text-tinta-suave">{formatDateTime(h.createdAt)}</Td>
                      <Td>{h.description}</Td>
                      <Td><Badge tone={tone}>{label}</Badge></Td>
                      <Td className={cn("text-right font-semibold tabular-nums", h.amount > 0 ? "text-exito" : "text-error")}>
                        {h.amount > 0 ? "+" : ""}
                        {formatNumber(h.amount)}
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card>
      </div>
    </>
  );
}
