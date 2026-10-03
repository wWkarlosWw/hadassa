import Link from "next/link";
import { ArrowRight, CalendarHeart, Coins, Gift, HandHeart, HeartHandshake, MapPin, Sparkles, Wallet } from "lucide-react";
import type { SessionUser } from "@/modules/auth/session";
import { donorSummary, listDonations } from "@/modules/donations/service";
import { listPublicProjects } from "@/modules/projects/service";
import { progressPercent } from "@/modules/projects/campaign";
import { StatCard } from "@/shared/ui/stat-card";
import { listMyParticipations } from "@/modules/events/service";
import { getHistory, getTotalEarned } from "@/modules/points/service";
import { levelFor } from "@/modules/points/rules";
import { Card, CardBody, CardHeader } from "@/shared/ui/card";
import { LinkButton } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { DonationStatusBadge } from "@/shared/ui/status-badges";
import { formatBs, formatDate, formatDateTime, formatNumber } from "@/shared/lib/utils";
import { ProgressBar } from "../progress";
import { isPast } from "../dates";

export async function UserDashboard({ user }: { user: SessionUser }) {
  const [donations, participations, history, totalEarned, summary, projects] = await Promise.all([
    listDonations({ profileId: user.id, take: 5 }),
    listMyParticipations(user.id),
    getHistory(user.id, 6),
    getTotalEarned(user.id),
    donorSummary(user.id),
    listPublicProjects(),
  ]);
  const supported = projects.filter((p) => summary.supportedProjectIds.includes(p.id));
  const activeParticipations = participations.filter((p) => p.status !== "CANCELLED").length;
  const level = levelFor(totalEarned);
  const upcoming = participations
    .filter((p) => p.status === "REGISTERED" && !isPast(p.event.startsAt, 86_400_000))
    .sort((a, b) => +new Date(a.event.startsAt) - +new Date(b.event.startsAt))
    .slice(0, 4);
  const firstName = user.fullName.split(" ")[0];

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow text-rosa-700">Mi panel</p>
        <h1 className="mt-1 font-serif text-3xl text-tinta sm:text-4xl">Hola, {firstName}</h1>
        <p className="mt-1.5 text-sm text-tinta-suave sm:text-base">Gracias por sembrar en la vida de mujeres y niños. Cada aporte florece.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Mis donaciones" value={formatNumber(summary.donationsCount)} icon={<HeartHandshake className="size-4" aria-hidden />} accent="#7f5153" />
        <StatCard label="Total donado" value={formatBs(summary.totalDonated)} hint="Donaciones aprobadas" icon={<Wallet className="size-4" aria-hidden />} accent="#b68286" />
        <StatCard label="Mis actividades" value={formatNumber(activeParticipations)} icon={<CalendarHeart className="size-4" aria-hidden />} accent="#5f6aa8" />
        <StatCard label="Mis puntos" value={formatNumber(user.points)} icon={<Coins className="size-4" aria-hidden />} accent="#b7791f" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-br from-vino to-malva p-6 text-white shadow-[var(--shadow-flor)] lg:col-span-2">
          <div className="pointer-events-none absolute -right-10 -bottom-12 size-56 rounded-full bg-white/10" aria-hidden />
          <div className="pointer-events-none absolute -top-16 right-24 size-40 rounded-full bg-rosa/20" aria-hidden />
          <div className="relative flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-sm text-white/80">Tus puntos disponibles</p>
              <p className="mt-1 font-serif text-5xl tabular-nums">{formatNumber(user.points)}</p>
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                <Sparkles className="size-3.5" aria-hidden /> Nivel {level.current.name}
              </p>
            </div>
            <LinkButton href="/panel/recompensas" variant="light" size="sm">
              <Gift className="size-4" aria-hidden /> Canjear recompensas
            </LinkButton>
          </div>
          <div className="relative mt-6">
            <ProgressBar value={level.progress} color="#ffffff" label="Progreso al siguiente nivel" />
            <p className="mt-2 text-xs text-white/80">
              {level.next
                ? `${formatNumber(level.next.min - totalEarned)} puntos más para llegar a ${level.next.name}.`
                : "¡Alcanzaste el nivel más alto! Gracias por tanto amor."}
            </p>
          </div>
        </div>

        <div className="grid gap-3">
          {[
            { href: "/panel/donar", label: "Registrar donación", hint: "Suma puntos con tu aporte", icon: HandHeart, color: "#7f5153" },
            { href: "/panel/actividades", label: "Actividades", hint: "Sirve como voluntario", icon: CalendarHeart, color: "#5f6aa8" },
            { href: "/panel/recompensas", label: "Recompensas", hint: "Descuentos de aliados", icon: Gift, color: "#c97f7f" },
          ].map(({ href, label, hint, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-4 rounded-[var(--radius-card)] border border-borde bg-papel px-4 py-3.5 shadow-[var(--shadow-suave)] transition hover:-translate-y-0.5 hover:border-rosa"
            >
              <span className="grid size-10 place-items-center rounded-full" style={{ background: `${color}1f`, color }}>
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-tinta">{label}</span>
                <span className="block text-xs text-tinta-suave">{hint}</span>
              </span>
              <ArrowRight className="size-4 text-tinta-suave transition group-hover:translate-x-0.5" aria-hidden />
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Mis donaciones recientes" action={<LinkButton href="/panel/donaciones" variant="ghost" size="sm">Ver todas</LinkButton>} />
          {donations.length === 0 ? (
            <EmptyState title="Aún no registras donaciones" description="Tu primera semilla puede cambiar una historia." action={<LinkButton href="/panel/donar" size="sm">Donar ahora</LinkButton>} />
          ) : (
            <ul className="divide-y divide-borde">
              {donations.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-3 px-5 py-3.5 sm:px-6">
                  <div className="min-w-0">
                    <p className="font-semibold text-tinta tabular-nums">{formatBs(d.amount)}</p>
                    <p className="truncate text-xs text-tinta-suave">
                      {d.project?.name ?? "Fondo general"} · {formatDate(d.createdAt)}
                    </p>
                  </div>
                  <DonationStatusBadge status={d.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="Próximas actividades" action={<LinkButton href="/panel/actividades" variant="ghost" size="sm">Explorar</LinkButton>} />
          {upcoming.length === 0 ? (
            <EmptyState title="No tienes actividades inscritas" description="Únete a una jornada y gana puntos por tu asistencia." />
          ) : (
            <ul className="divide-y divide-borde">
              {upcoming.map((p) => (
                <li key={p.id} className="flex items-start gap-4 px-5 py-3.5 sm:px-6">
                  <span className="grid w-12 shrink-0 place-items-center rounded-xl bg-lavanda-50 py-1.5 text-center text-lavanda-700">
                    <span className="text-lg leading-none font-bold">{formatDate(p.event.startsAt, { day: "2-digit" })}</span>
                    <span className="text-[0.65rem] font-semibold uppercase">{formatDate(p.event.startsAt, { month: "short" })}</span>
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-tinta">{p.event.title}</p>
                    <p className="flex items-center gap-1 text-xs text-tinta-suave">
                      <MapPin className="size-3" aria-hidden /> {p.event.location || "Por confirmar"} · +{p.event.pointsReward} pts
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Campañas que apoyo"
          description="Proyectos a los que tus donaciones aprobadas ya están ayudando."
          action={<LinkButton href="/proyectos" variant="ghost" size="sm">Explorar campañas</LinkButton>}
        />
        {supported.length === 0 ? (
          <EmptyState title="Aún no apoyas una campaña" description="Elige una causa y sé parte de la transformación." action={<LinkButton href="/proyectos" size="sm">Ver campañas</LinkButton>} />
        ) : (
          <ul className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
            {supported.map((p) => (
              <li key={p.id}>
                <Link href={`/proyectos/${p.slug}`} className="block rounded-xl border border-borde p-4 transition hover:border-rosa">
                  <p className="font-serif text-lg text-tinta">{p.name}</p>
                  <p className="text-xs text-tinta-suave">
                    {formatBs(p.raised)}
                    {p.goal ? ` de ${formatBs(p.goal)}` : ""}
                  </p>
                  {p.goal ? (
                    <div className="mt-2">
                      <ProgressBar value={progressPercent(p.raised, p.goal) / 100} color={p.color} label={`Progreso de ${p.name}`} />
                    </div>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <CardHeader title="Movimientos de puntos" action={<LinkButton href="/panel/puntos" variant="ghost" size="sm">Historial</LinkButton>} />
        {history.length === 0 ? (
          <CardBody>
            <p className="text-sm text-tinta-suave">Aún no tienes movimientos. Dona o participa en una actividad para empezar a sumar.</p>
          </CardBody>
        ) : (
          <ul className="divide-y divide-borde">
            {history.map((h) => (
              <li key={h.id} className="flex items-center justify-between gap-3 px-5 py-3 sm:px-6">
                <div className="min-w-0">
                  <p className="truncate text-sm text-tinta">{h.description || h.reason}</p>
                  <p className="text-xs text-tinta-suave">{formatDateTime(h.createdAt)}</p>
                </div>
                <span className={`font-semibold tabular-nums ${h.amount > 0 ? "text-exito" : "text-error"}`}>
                  {h.amount > 0 ? "+" : ""}
                  {formatNumber(h.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
