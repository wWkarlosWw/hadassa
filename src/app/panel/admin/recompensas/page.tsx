import Link from "next/link";
import Image from "next/image";
import { Ban, Check, Store, Trash2 } from "lucide-react";
import { requireRole } from "@/modules/auth/session";
import { listAllClaims, listAllies, listAllRewards } from "@/modules/rewards/service";
import { cancelClaimAction, deleteAllyAction, deleteRewardAction, redeemClaimAction } from "@/modules/rewards/actions";
import { AllyDialog, RewardDialog } from "@/modules/rewards/components/reward-dialog";
import { ConfirmAction } from "@/modules/panel/confirm-action";
import { toDateInput } from "@/modules/panel/dates";
import { PageHeader } from "@/shared/ui/page-header";
import { Card, CardHeader } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { EmptyState } from "@/shared/ui/empty-state";
import { Table, Td, Th } from "@/shared/ui/table";
import { ClaimStatusBadge } from "@/shared/ui/status-badges";
import { cn, formatDate, formatDateTime, formatNumber } from "@/shared/lib/utils";

export const metadata = { title: "Gestionar recompensas" };

const TABS = [
  { value: "recompensas", label: "Recompensas" },
  { value: "aliados", label: "Aliados" },
  { value: "canjes", label: "Canjes" },
] as const;

export default async function RecompensasAdminPage({ searchParams }: PageProps<"/panel/admin/recompensas">) {
  await requireRole("ADMIN");
  const { tab: rawTab } = await searchParams;
  const tab = TABS.find((t) => t.value === rawTab)?.value ?? "recompensas";
  const [rewards, allies, claims] = await Promise.all([listAllRewards(), listAllies(), listAllClaims()]);
  const allyOptions = allies.map((a) => ({ id: a.id, name: a.name }));
  const pendingClaims = claims.filter((c) => c.status === "PENDING").length;

  return (
    <>
      <PageHeader
        title="Recompensas"
        description="Beneficios que los donantes canjean con sus puntos, aportados por empresas aliadas."
        actions={tab === "aliados" ? <AllyDialog /> : tab === "recompensas" ? <RewardDialog allies={allyOptions} /> : undefined}
      />

      <nav aria-label="Secciones" className="mb-5 flex gap-1 border-b border-borde">
        {TABS.map((t) => (
          <Link
            key={t.value}
            href={t.value === "recompensas" ? "/panel/admin/recompensas" : `/panel/admin/recompensas?tab=${t.value}`}
            aria-current={tab === t.value ? "page" : undefined}
            className={cn(
              "-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition",
              tab === t.value ? "border-vino text-vino" : "border-transparent text-tinta-suave hover:text-tinta",
            )}
          >
            {t.label}
            {t.value === "canjes" && pendingClaims > 0 && <Badge tone="alerta">{pendingClaims}</Badge>}
          </Link>
        ))}
      </nav>

      {tab === "recompensas" && (
        <Card>
          {rewards.length === 0 ? (
            <EmptyState title="Aún no hay recompensas" />
          ) : (
            <Table className="min-w-[760px]">
              <thead>
                <tr>
                  <Th>Recompensa</Th>
                  <Th>Costo</Th>
                  <Th>Stock</Th>
                  <Th>Canjes</Th>
                  <Th>Estado</Th>
                  <Th className="text-right">Acciones</Th>
                </tr>
              </thead>
              <tbody>
                {rewards.map((r) => {
                  const expired = r.expiresAt && new Date(r.expiresAt) <= new Date();
                  return (
                    <tr key={r.id}>
                      <Td>
                        <p className="font-semibold">
                          {r.title} {r.discountPercent ? <span className="text-xs text-vino">(-{r.discountPercent}%)</span> : null}
                        </p>
                        <p className="text-xs text-tinta-suave">
                          <code className="font-mono">{r.code}</code> · {r.ally?.name ?? "Fundación Hadassa"}
                          {r.expiresAt ? ` · vence ${formatDate(r.expiresAt)}` : ""}
                        </p>
                      </Td>
                      <Td className="font-semibold tabular-nums">{formatNumber(r.pointsCost)} pts</Td>
                      <Td className="tabular-nums">{r.stock ?? "∞"}</Td>
                      <Td className="tabular-nums">{r._count.claims}</Td>
                      <Td>
                        {!r.isActive ? <Badge>Inactiva</Badge> : expired ? <Badge tone="alerta">Vencida</Badge> : r.stock === 0 ? <Badge tone="alerta">Agotada</Badge> : <Badge tone="exito">Disponible</Badge>}
                      </Td>
                      <Td>
                        <div className="flex justify-end">
                          <RewardDialog
                            allies={allyOptions}
                            reward={{
                              id: r.id, title: r.title, description: r.description, code: r.code, discountPercent: r.discountPercent,
                              pointsCost: r.pointsCost, stock: r.stock, expiresAt: toDateInput(r.expiresAt), allyId: r.allyId,
                              imageUrl: r.imageUrl, isActive: r.isActive,
                            }}
                          />
                          <ConfirmAction
                            action={deleteRewardAction}
                            fields={{ id: r.id }}
                            variant="ghost"
                            size="icon"
                            ariaLabel={`Eliminar ${r.title}`}
                            icon={<Trash2 className="size-4" aria-hidden />}
                            title="Eliminar recompensa"
                            description="Si ya fue canjeada, se desactivará para conservar el historial."
                            confirmLabel="Eliminar"
                            confirmVariant="danger"
                          />
                        </div>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card>
      )}

      {tab === "aliados" && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {allies.length === 0 && (
            <Card className="sm:col-span-2 xl:col-span-3"><EmptyState title="Aún no hay aliados" description="Suma empresas que quieran premiar a los donantes." /></Card>
          )}
          {allies.map((a) => (
            <Card key={a.id} className="flex flex-col p-5">
              <div className="flex items-start gap-3">
                <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-lavanda-50 text-lavanda-700">
                  {a.logoUrl ? <Image src={a.logoUrl} alt="" width={48} height={48} className="size-full object-cover" /> : <Store className="size-5" aria-hidden />}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-serif text-lg">{a.name}</h2>
                  <p className="text-xs text-tinta-suave">{a._count.rewards} recompensas</p>
                </div>
                <div className="flex shrink-0">
                  <AllyDialog ally={{ id: a.id, name: a.name, description: a.description, website: a.website, contactEmail: a.contactEmail, logoUrl: a.logoUrl, isActive: a.isActive }} />
                  <ConfirmAction
                    action={deleteAllyAction}
                    fields={{ id: a.id }}
                    variant="ghost"
                    size="icon"
                    ariaLabel={`Eliminar ${a.name}`}
                    icon={<Trash2 className="size-4" aria-hidden />}
                    title={`Eliminar ${a.name}`}
                    description="Sus recompensas se conservarán, pero sin aliado asociado."
                    confirmLabel="Eliminar"
                    confirmVariant="danger"
                  />
                </div>
              </div>
              {a.description && <p className="mt-3 text-sm text-tinta-suave">{a.description}</p>}
              <div className="mt-auto flex flex-wrap gap-x-3 gap-y-1 pt-3 text-xs">
                {!a.isActive && <Badge>Inactivo</Badge>}
                {a.website && <a href={a.website} target="_blank" rel="noreferrer" className="font-semibold text-lavanda-700 hover:underline">Sitio web</a>}
                {a.contactEmail && <a href={`mailto:${a.contactEmail}`} className="font-semibold text-lavanda-700 hover:underline">{a.contactEmail}</a>}
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "canjes" && (
        <Card>
          <CardHeader title="Canjes" description="Marca como usado cuando el beneficio se entregue. Cancelar devuelve los puntos." />
          {claims.length === 0 ? (
            <EmptyState title="Aún no hay canjes" />
          ) : (
            <Table className="min-w-[760px]">
              <thead>
                <tr>
                  <Th>Fecha</Th>
                  <Th>Usuario</Th>
                  <Th>Recompensa</Th>
                  <Th>Puntos</Th>
                  <Th>Estado</Th>
                  <Th className="text-right">Acciones</Th>
                </tr>
              </thead>
              <tbody>
                {claims.map((c) => (
                  <tr key={c.id}>
                    <Td className="whitespace-nowrap text-tinta-suave">{formatDateTime(c.createdAt)}</Td>
                    <Td>
                      <p className="font-semibold">{c.profile.fullName}</p>
                      <p className="text-xs text-tinta-suave">{c.profile.email}</p>
                    </Td>
                    <Td>
                      {c.reward.title}
                      <code className="ml-2 font-mono text-xs text-tinta-suave">{c.reward.code}</code>
                    </Td>
                    <Td className="tabular-nums">{formatNumber(c.pointsSpent)}</Td>
                    <Td><ClaimStatusBadge status={c.status} /></Td>
                    <Td>
                      {c.status === "PENDING" ? (
                        <div className="flex justify-end gap-1">
                          <ConfirmAction
                            action={redeemClaimAction}
                            fields={{ id: c.id }}
                            variant="outline"
                            icon={<Check className="size-4" aria-hidden />}
                            label="Usado"
                            title="Marcar como usado"
                            description={`${c.reward.title} — ${c.profile.fullName}`}
                          />
                          <ConfirmAction
                            action={cancelClaimAction}
                            fields={{ id: c.id }}
                            variant="ghost"
                            size="icon"
                            ariaLabel="Cancelar canje"
                            icon={<Ban className="size-4" aria-hidden />}
                            title="Cancelar canje"
                            description={`Se devolverán ${formatNumber(c.pointsSpent)} puntos a ${c.profile.fullName}.`}
                            confirmLabel="Cancelar canje"
                            confirmVariant="danger"
                          />
                        </div>
                      ) : (
                        <span className="block text-right text-xs text-tinta-suave">—</span>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      )}
    </>
  );
}
