import type { Metadata } from "next";
import { getSection } from "@/modules/cms/service";
import { listUpcomingEvents } from "@/modules/events/service";
import { EventCard } from "@/modules/site/event-card";
import { PageHero } from "@/modules/site/page-hero";
import { Reveal } from "@/modules/site/reveal";
import { seoMetadata } from "@/modules/site/metadata";
import { EmptyState } from "@/shared/ui/empty-state";
import { LinkButton } from "@/shared/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  return seoMetadata(await getSection("activitiesPage"));
}

export default async function ActividadesPage() {
  const [page, events] = await Promise.all([getSection("activitiesPage"), listUpcomingEvents(30)]);
  return (
    <>
      <PageHero eyebrow={page.eyebrow} title={page.title} subtitle={page.subtitle} />
      <section className="bg-crema px-4 pb-28 sm:px-6 lg:px-8">
        {events.length === 0 ? (
          <EmptyState
            title={page.emptyTitle}
            description={page.emptyText}
            action={page.emptyCta ? <LinkButton href="/donar">{page.emptyCta}</LinkButton> : undefined}
          />
        ) : (
          <ul className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((e, i) => (
              <li key={e.id}>
                <Reveal delay={(i % 3) * 0.08} className="h-full">
                  <EventCard event={e} labels={page} />
                </Reveal>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
