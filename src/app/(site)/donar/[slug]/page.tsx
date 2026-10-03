import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock, Heart, MapPin, MessageCircleHeart, Newspaper, Trophy, Users } from "lucide-react";
import { getCampaign } from "@/modules/projects/service";
import { getSection } from "@/modules/cms/service";
import { fillTemplate } from "@/modules/cms/definitions";
import { listUpcomingEvents } from "@/modules/events/service";
import { countLabel, daysLeft, relativeTime } from "@/modules/projects/campaign";
import { CampaignProgress } from "@/modules/site/campaigns/campaign-progress";
import { ShareButtons } from "@/modules/site/campaigns/share-buttons";
import { EventCard } from "@/modules/site/event-card";
import { Reveal } from "@/modules/site/reveal";
import { buttonClasses } from "@/shared/ui/button";
import { formatBs, formatDate, formatNumber } from "@/shared/lib/utils";

export async function generateMetadata(props: PageProps<"/donar/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const data = await getCampaign(slug);
  if (!data) return {};
  const { project } = data;
  return {
    title: project.name,
    description: project.tagline,
    openGraph: project.coverUrl ? { images: [project.coverUrl] } : undefined,
  };
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function CampanaPage(props: PageProps<"/donar/[slug]">) {
  const { slug } = await props.params;
  const [data, page, c, activities] = await Promise.all([
    getCampaign(slug),
    getSection("projectsPage"),
    getSection("campaigns"),
    getSection("activitiesPage"),
  ]);
  if (!data) notFound();
  const { project, recentDonations, supportMessages, updates, topDonors } = data;
  const events = await listUpcomingEvents(3, project.id);

  const days = daysLeft(project.endsAt);
  const story = (project.story || project.description).split(/\n\s*\n/).filter(Boolean);
  const url = `${SITE_URL}/donar/${project.slug}`;
  const now = new Date();

  return (
    <>
      {/* Portada */}
      <section className="relative isolate overflow-hidden pt-28 pb-14 sm:pt-36" style={{ background: project.color }}>
        {project.coverUrl && <Image src={project.coverUrl} alt="" fill priority sizes="100vw" className="-z-10 object-cover" />}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-noche-900/85 via-noche-900/45 to-noche-900/30" aria-hidden />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Link href="/donar" className="inline-flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white">
            <ArrowLeft className="size-4" aria-hidden /> {page.backLabel}
          </Link>
          <div className="mt-24 flex flex-wrap items-center gap-2 sm:mt-32">
            {project.category && (
              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-tinta">{project.category}</span>
            )}
            {project.location && (
              <span className="inline-flex items-center gap-1 rounded-full bg-noche-900/50 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                <MapPin className="size-3.5" aria-hidden /> {project.location}
              </span>
            )}
          </div>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl text-white drop-shadow sm:text-6xl">{project.name}</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/95 drop-shadow sm:text-lg">{project.tagline}</p>
        </div>
      </section>

      <section className="bg-crema py-12 sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_22rem] lg:px-8">
          {/* Tarjeta de donación (fija en escritorio, primero en móvil) */}
          <aside className="lg:order-last">
            <div className="space-y-5 rounded-[var(--radius-card)] border border-borde bg-papel p-6 shadow-[var(--shadow-flor)] lg:sticky lg:top-24">
              <CampaignProgress
                raised={project.raised}
                goal={project.goal}
                color={project.color}
                raisedLabel={page.raisedLabel}
                goalLabel={page.goalLabel}
                size="lg"
              />
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-crema p-3">
                  <dt className="sr-only">Donaciones</dt>
                  <dd className="flex items-center gap-2 text-tinta">
                    <Heart className="size-4 text-vino" aria-hidden />
                    {countLabel(project.donationsCount, c.donationsLabel, c.donationsLabelOne)}
                  </dd>
                </div>
                {days !== null ? (
                  <div className="rounded-xl bg-crema p-3">
                    <dt className="sr-only">Plazo</dt>
                    <dd className="flex items-center gap-2 text-tinta">
                      <Clock className="size-4 text-lavanda-600" aria-hidden />
                      {days > 0 ? fillTemplate(c.daysLeftLabel, { n: days }) : c.endedLabel}
                    </dd>
                  </div>
                ) : project.beneficiaries > 0 ? (
                  <div className="rounded-xl bg-crema p-3">
                    <dt className="sr-only">Beneficiarios</dt>
                    <dd className="flex items-center gap-2 text-tinta">
                      <Users className="size-4 text-lavanda-600" aria-hidden />
                      {formatNumber(project.beneficiaries)}
                    </dd>
                  </div>
                ) : null}
              </dl>

              {project.acceptsDonations ? (
                <Link href={`/donar/${project.slug}/aportar`} className={buttonClasses("vino", "lg", "w-full")}>
                  <Heart className="size-4 fill-current" aria-hidden /> {c.donateNowButton}
                </Link>
              ) : (
                <p className="rounded-xl bg-lavanda-50 p-4 text-sm text-lavanda-700">{c.closedNotice}</p>
              )}
              <ShareButtons url={url} text={`${project.name} — ${project.tagline}`} label={c.shareButton} />

              <div className="border-t border-borde pt-5">
                <h2 className="font-serif text-lg text-tinta">{c.recentTitle}</h2>
                {recentDonations.length === 0 ? (
                  <p className="mt-2 text-sm text-tinta-suave">{c.recentEmpty}</p>
                ) : (
                  <ul className="mt-3 space-y-3">
                    {recentDonations.slice(0, 5).map((d) => (
                      <li key={d.id} className="flex items-center gap-3 text-sm">
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-rosa-100 text-vino">
                          <Heart className="size-4" aria-hidden />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-tinta">
                            <strong className="font-semibold">{d.name}</strong> {c.donatedVerb} {formatBs(d.amount)}
                          </span>
                          <span className="text-xs text-tinta-suave">{relativeTime(d.createdAt, now)}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </aside>

          {/* Historia, novedades y mensajes */}
          <div className="min-w-0 space-y-14">
            <Reveal>
              <h2 className="font-serif text-3xl text-tinta">{c.storyTitle}</h2>
              <div className="mt-5 space-y-5 text-lg leading-relaxed text-tinta-suave">
                {story.map((p, i) => (
                  <p key={i} className="whitespace-pre-line">
                    {p}
                  </p>
                ))}
              </div>
              {project.slug === "casa-de-fruto" && (
                <Link href="/casa-de-fruto" className={buttonClasses("outline", "md", "mt-6")}>
                  {c.casaDeFrutoLink} <ArrowRight className="size-4" aria-hidden />
                </Link>
              )}
            </Reveal>

            {topDonors.length > 0 && (
              <Reveal>
                <h2 className="flex items-center gap-2 font-serif text-2xl text-tinta">
                  <Trophy className="size-5 text-alerta" aria-hidden /> {c.topDonorsTitle}
                </h2>
                <ol className="mt-4 grid gap-3 sm:grid-cols-3">
                  {topDonors.map((t, i) => (
                    <li key={i} className="rounded-xl border border-borde bg-papel p-4">
                      <span className="text-xs font-semibold text-tinta-suave">#{i + 1}</span>
                      <p className="mt-1 font-semibold text-tinta">{t.name}</p>
                      <p className="text-sm text-tinta-suave">{formatBs(t.amount)}</p>
                    </li>
                  ))}
                </ol>
              </Reveal>
            )}

            {updates.length > 0 && (
              <Reveal>
                <h2 className="flex items-center gap-2 font-serif text-2xl text-tinta">
                  <Newspaper className="size-5 text-lavanda-600" aria-hidden /> {c.updatesTitle}
                </h2>
                <ol className="relative mt-6 space-y-8 border-l-2 border-rosa-200 pl-6">
                  {updates.map((u) => (
                    <li key={u.id} className="relative">
                      <span className="absolute top-1.5 -left-[1.95rem] size-3.5 rounded-full border-2 border-white" style={{ background: project.color }} aria-hidden />
                      <time className="text-xs font-semibold tracking-wide text-tinta-suave uppercase" dateTime={u.createdAt.toISOString()}>
                        {formatDate(u.createdAt, { dateStyle: "long" })}
                      </time>
                      <h3 className="mt-1 font-serif text-xl text-tinta">{u.title}</h3>
                      {u.body && <p className="mt-2 leading-relaxed whitespace-pre-line text-tinta-suave">{u.body}</p>}
                      {u.imageUrl && (
                        <div className="relative mt-4 aspect-[16/9] overflow-hidden rounded-xl">
                          <Image src={u.imageUrl} alt="" fill sizes="(min-width: 1024px) 640px, 100vw" className="object-cover" />
                        </div>
                      )}
                    </li>
                  ))}
                </ol>
              </Reveal>
            )}

            {supportMessages.length > 0 && (
              <Reveal>
                <h2 className="flex items-center gap-2 font-serif text-2xl text-tinta">
                  <MessageCircleHeart className="size-5 text-rosa-500" aria-hidden /> {c.messagesTitle}
                </h2>
                <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                  {supportMessages.map((m) => (
                    <li key={m.id} className="rounded-xl border border-borde bg-papel p-5">
                      <p className="font-serif text-lg leading-relaxed text-tinta">“{m.message}”</p>
                      <p className="mt-3 text-sm text-tinta-suave">
                        <strong className="font-semibold text-tinta">{m.name}</strong> · {formatBs(m.amount)} · {relativeTime(m.createdAt, now)}
                      </p>
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {events.length > 0 && (
        <section className="bg-papel py-16">
          <h2 className="px-4 text-center font-serif text-3xl text-tinta">{c.eventsTitle}</h2>
          <ul className="mx-auto mt-10 grid max-w-6xl gap-6 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-3 lg:px-8">
            {events.map((e) => (
              <li key={e.id}>
                <EventCard event={e} labels={activities} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
