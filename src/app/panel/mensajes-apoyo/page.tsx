import Link from "next/link";
import { requireRole } from "@/modules/auth/session";
import { listSupportMessages } from "@/modules/donations/service";
import { MessageVisibilityButton } from "@/modules/donations/components/message-visibility";
import { donorDisplayName } from "@/modules/projects/campaign";
import { PageHeader } from "@/shared/ui/page-header";
import { Card } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { EmptyState } from "@/shared/ui/empty-state";
import { DonationStatusBadge } from "@/shared/ui/status-badges";
import { cn, formatBs, formatDateTime } from "@/shared/lib/utils";

export const metadata = { title: "Palabras de apoyo" };

export default async function MensajesApoyoPage({ searchParams }: PageProps<"/panel/mensajes-apoyo">) {
  await requireRole("SUPERVISOR", "ADMIN");
  const { ver } = await searchParams;
  const all = await listSupportMessages();
  const filter = ver === "ocultos" ? "ocultos" : ver === "visibles" ? "visibles" : "todos";
  const messages = all.filter((m) => (filter === "ocultos" ? m.messageHidden : filter === "visibles" ? !m.messageHidden : true));

  return (
    <>
      <PageHeader
        title="Palabras de apoyo"
        description="Mensajes que los donantes dejan al donar. Solo se publican los de donaciones aprobadas y no ocultas."
      />
      <nav className="mb-4 flex flex-wrap gap-2" aria-label="Filtrar mensajes">
        {[
          ["todos", "Todos"],
          ["visibles", "Visibles"],
          ["ocultos", "Ocultos"],
        ].map(([v, label]) => (
          <Link
            key={v}
            href={v === "todos" ? "/panel/mensajes-apoyo" : `/panel/mensajes-apoyo?ver=${v}`}
            aria-current={filter === v ? "page" : undefined}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium",
              filter === v ? "border-vino bg-vino text-white" : "border-borde bg-papel text-tinta-suave hover:text-tinta",
            )}
          >
            {label}
          </Link>
        ))}
      </nav>
      {messages.length === 0 ? (
        <Card>
          <EmptyState title="No hay mensajes" />
        </Card>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {messages.map((m) => (
            <li key={m.id}>
              <Card className={cn("flex h-full flex-col p-5", m.messageHidden && "opacity-70")}>
                <p className={cn("flex-1 font-serif text-lg leading-relaxed text-tinta", m.messageHidden && "line-through")}>“{m.message}”</p>
                <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs text-tinta-suave">
                  <span className="font-semibold text-tinta">
                    {donorDisplayName({ isAnonymous: m.isAnonymous, fullName: m.profile?.fullName, donorName: m.donorName })}
                  </span>
                  {m.isAnonymous && m.profile && <span>({m.profile.fullName})</span>}
                  <span>· {formatBs(m.amount)}</span>
                  <span>· {m.project?.name ?? "Fondo general"}</span>
                  <span>· {formatDateTime(m.createdAt)}</span>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex gap-1.5">
                    <DonationStatusBadge status={m.status} />
                    {m.messageHidden ? <Badge tone="error">Oculto</Badge> : <Badge tone="exito">Visible</Badge>}
                  </div>
                  <MessageVisibilityButton id={m.id} hidden={m.messageHidden} />
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
