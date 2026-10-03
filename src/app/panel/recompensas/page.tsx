import Image from "next/image";
import { Store, Ticket } from "lucide-react";
import { requireUser } from "@/modules/auth/session";
import { listAvailableRewards, listMyClaims } from "@/modules/rewards/service";
import { ClaimRewardButton } from "@/modules/rewards/components/claim-button";
import { PageHeader } from "@/shared/ui/page-header";
import { Card, CardHeader } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { EmptyState } from "@/shared/ui/empty-state";
import { ClaimStatusBadge } from "@/shared/ui/status-badges";
import { formatDate, formatNumber } from "@/shared/lib/utils";

export const metadata = { title: "Recompensas" };

export default async function RecompensasPage() {
  const user = await requireUser();
  const [rewards, claims] = await Promise.all([listAvailableRewards(), listMyClaims(user.id)]);

  return (
    <>
      <PageHeader
        title="Recompensas"
        description="Tu generosidad también florece para ti: canjea tus puntos por beneficios de nuestros aliados."
        actions={
          <span className="rounded-full bg-papel px-4 py-2 text-sm font-semibold text-vino shadow-[var(--shadow-suave)] ring-1 ring-borde">
            {formatNumber(user.points)} puntos disponibles
          </span>
        }
      />

      {rewards.length === 0 ? (
        <Card>
          <EmptyState title="No hay recompensas disponibles" description="Nuestros aliados están preparando nuevos beneficios." />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rewards.map((r) => (
            <article key={r.id} className="flex flex-col rounded-[var(--radius-card)] border border-borde bg-papel p-5 shadow-[var(--shadow-suave)]">
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-rosa-50 text-vino">
                  {r.imageUrl || r.ally?.logoUrl ? (
                    <Image src={(r.imageUrl || r.ally?.logoUrl)!} alt="" width={48} height={48} className="size-full object-cover" />
                  ) : (
                    <Ticket className="size-5" aria-hidden />
                  )}
                </span>
                {r.discountPercent ? <Badge tone="vino">-{r.discountPercent}%</Badge> : null}
              </div>
              <h2 className="mt-4 font-serif text-lg">{r.title}</h2>
              {r.ally && (
                <p className="flex items-center gap-1.5 text-xs text-tinta-suave">
                  <Store className="size-3.5" aria-hidden /> {r.ally.name}
                </p>
              )}
              {r.description && <p className="mt-2 text-sm text-tinta-suave">{r.description}</p>}
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-tinta-suave">
                {r.stock !== null && <span>Quedan {r.stock}</span>}
                {r.expiresAt && <span>Vence {formatDate(r.expiresAt)}</span>}
              </div>
              <div className="mt-auto space-y-3 pt-5">
                <p className="font-serif text-2xl text-lavanda-700 tabular-nums">
                  {formatNumber(r.pointsCost)} <span className="font-sans text-xs font-semibold text-tinta-suave">puntos</span>
                </p>
                <ClaimRewardButton rewardId={r.id} title={r.title} cost={r.pointsCost} balance={user.points} />
              </div>
            </article>
          ))}
        </div>
      )}

      <Card className="mt-8">
        <CardHeader title="Mis canjes" description="Presenta el código en el comercio aliado." />
        {claims.length === 0 ? (
          <EmptyState title="Aún no canjeas recompensas" />
        ) : (
          <ul className="divide-y divide-borde">
            {claims.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 sm:px-6">
                <div className="min-w-0">
                  <p className="font-semibold">{c.reward.title}</p>
                  <p className="text-xs text-tinta-suave">
                    {c.reward.ally?.name ? `${c.reward.ally.name} · ` : ""}
                    {formatDate(c.createdAt)} · {formatNumber(c.pointsSpent)} pts
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {c.status !== "CANCELLED" && (
                    <code className="rounded-lg bg-lavanda-50 px-3 py-1 font-mono text-sm font-semibold tracking-wider text-lavanda-700">{c.reward.code}</code>
                  )}
                  <ClaimStatusBadge status={c.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
