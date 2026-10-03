import Link from "next/link";
import { HandCoins, HeartHandshake, Hourglass, Mail, Repeat, Users } from "lucide-react";
import type { SessionUser } from "@/modules/auth/session";
import { donationStats, listDonations, monthlyTotals } from "@/modules/donations/service";
import { userStats } from "@/modules/users/service";
import { listAllProjects } from "@/modules/projects/service";
import { listContactMessages } from "@/modules/cms/service";
import { Card, CardBody, CardHeader } from "@/shared/ui/card";
import { LinkButton } from "@/shared/ui/button";
import { StatCard } from "@/shared/ui/stat-card";
import { EmptyState } from "@/shared/ui/empty-state";
import { Badge } from "@/shared/ui/badge";
import { formatBs, formatDate, formatNumber } from "@/shared/lib/utils";
import { METHOD_LABEL } from "@/shared/ui/status-badges";
import { MonthlyBarChart } from "../bar-chart";
import { ProgressBar } from "../progress";

export async function AdminDashboard({ user }: { user: SessionUser }) {
  const [stats, users, monthly, projects, pending, messages] = await Promise.all([
    donationStats(),
    userStats(),
    monthlyTotals(6),
    listAllProjects(),
    listDonations({ status: "PENDING", take: 5 }),
    listContactMessages(),
  ]);
  const unread = messages.filter((m) => !m.isRead);
  const topCampaigns = [...projects].filter((p) => p.isActive).sort((a, b) => b.raised - a.raised);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-vino">Administración</p>
          <h1 className="mt-1 font-serif text-3xl sm:text-4xl">Hola, {user.fullName.split(" ")[0]}</h1>
          <p className="mt-1.5 text-sm text-tinta-suave">Así va floreciendo la Fundación Hadassa.</p>
        </div>
        <LinkButton href="/panel/admin/donaciones/nueva" variant="vino" size="sm">
          <HandCoins className="size-4" aria-hidden /> Registrar donación
        </LinkButton>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total recaudado" value={formatBs(stats.totalRaised)} hint={`${formatNumber(stats.approvedCount)} donaciones aprobadas`} icon={<HandCoins className="size-4" />} accent="#7f5153" />
        <StatCard label="Por validar" value={formatNumber(stats.pendingCount)} hint={<Link href="/panel/validar-donaciones" className="underline-offset-2 hover:underline">Revisar ahora</Link>} icon={<Hourglass className="size-4" />} accent="#b7791f" />
        <StatCard label="Donantes" value={formatNumber(stats.donorsCount)} hint="con al menos una donación aprobada" icon={<HeartHandshake className="size-4" />} accent="#c97f7f" />
        <StatCard label="Donantes mensuales" value={formatNumber(stats.recurringDonorsCount)} hint="marcaron «donar cada mes»" icon={<Repeat className="size-4" />} accent="#8e9ace" />
        <StatCard label="Usuarios" value={formatNumber(users.total)} hint={`+${formatNumber(users.newThisMonth)} este mes`} icon={<Users className="size-4" />} accent="#5f6aa8" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader title="Recaudación mensual" description="Donaciones aprobadas, últimos 6 meses." />
          <CardBody>
            <MonthlyBarChart data={monthly} />
          </CardBody>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader title="Campañas" description="Ordenadas por lo recaudado, frente a su meta." action={<LinkButton href="/panel/admin/proyectos" variant="ghost" size="sm">Gestionar</LinkButton>} />
          <CardBody className="space-y-5">
            {projects.length === 0 && <p className="text-sm text-tinta-suave">Aún no hay proyectos.</p>}
            {topCampaigns.map((p, i) => (
              <div key={p.id}>
                <div className="mb-1.5 flex items-baseline justify-between gap-2 text-sm">
                  <span className="flex items-center gap-2 font-semibold">
                    <span className="w-4 text-xs text-tinta-suave tabular-nums">{i + 1}</span>
                    <span className="size-2.5 rounded-full" style={{ background: p.color }} aria-hidden />
                    {p.name}
                    <span className="text-xs font-normal text-tinta-suave">· {formatNumber(p.donationsCount)} don.</span>
                  </span>
                  <span className="text-xs text-tinta-suave tabular-nums">
                    {formatBs(p.raised)}
                    {p.goal ? ` / ${formatBs(p.goal)}` : ""}
                  </span>
                </div>
                <ProgressBar value={p.goal ? p.raised / p.goal : 0} color={p.color} label={`${p.name}: progreso de la meta`} />
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Donaciones pendientes" action={<LinkButton href="/panel/validar-donaciones" variant="ghost" size="sm">Validar</LinkButton>} />
          {pending.length === 0 ? (
            <EmptyState title="Todo al día" description="No hay donaciones esperando validación." />
          ) : (
            <ul className="divide-y divide-borde">
              {pending.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-3 px-5 py-3.5 sm:px-6">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{d.profile?.fullName ?? d.donorName ?? "Anónimo"}</p>
                    <p className="truncate text-xs text-tinta-suave">
                      {METHOD_LABEL[d.method]} · {d.project?.name ?? "Fondo general"} · {formatDate(d.createdAt)}
                    </p>
                  </div>
                  <span className="font-semibold tabular-nums">{formatBs(d.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <CardHeader
            title="Mensajes de contacto"
            description={unread.length ? `${unread.length} sin leer` : undefined}
            action={<LinkButton href="/panel/admin/mensajes" variant="ghost" size="sm">Ver todos</LinkButton>}
          />
          {messages.length === 0 ? (
            <EmptyState title="Sin mensajes" description="Los mensajes del formulario de contacto aparecerán aquí." />
          ) : (
            <ul className="divide-y divide-borde">
              {messages.slice(0, 5).map((m) => (
                <li key={m.id} className="flex items-start gap-3 px-5 py-3.5 sm:px-6">
                  <Mail className={`mt-0.5 size-4 shrink-0 ${m.isRead ? "text-tinta-suave/50" : "text-lavanda-600"}`} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 text-sm font-semibold">
                      <span className="truncate">{m.name}</span>
                      {!m.isRead && <Badge tone="lavanda">Nuevo</Badge>}
                    </p>
                    <p className="line-clamp-1 text-xs text-tinta-suave">{m.message}</p>
                  </div>
                  <span className="shrink-0 text-xs text-tinta-suave">{formatDate(m.createdAt, { day: "numeric", month: "short" })}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
