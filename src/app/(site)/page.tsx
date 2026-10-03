import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";
import { getSection } from "@/modules/cms/service";
import { listPublicProjects } from "@/modules/projects/service";
import { listUpcomingEvents } from "@/modules/events/service";
import { Hero } from "@/modules/site/hero";
import { DoorCards } from "@/modules/site/door-cards";
import { SectionHeading } from "@/modules/site/section-heading";
import { Presentation } from "@/modules/site/presentation";
import { DonationBand } from "@/modules/site/donation-band";
import { EventCard } from "@/modules/site/event-card";
import { PhotoGallery } from "@/modules/site/photo-gallery";
import Image from "next/image";
import { Reveal } from "@/modules/site/reveal";
import { seoMetadata } from "@/modules/site/metadata";
import { buttonClasses } from "@/shared/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  const home = await getSection("home");
  // Sin título propio, la portada usa el título por defecto del sitio.
  return seoMetadata(home);
}

export default async function HomePage() {
  const [home, about, donation, site, activities, projectsPage, projects, events] = await Promise.all([
    getSection("home"),
    getSection("about"),
    getSection("donation"),
    getSection("site"),
    getSection("activitiesPage"),
    getSection("projectsPage"),
    listPublicProjects(),
    listUpcomingEvents(3),
  ]);

  return (
    <>
      <Hero
        eyebrow={home.heroEyebrow}
        title={home.heroTitle}
        subtitle={home.heroSubtitle}
        cta={home.heroCta}
        ctaHref={home.heroCtaHref}
        secondaryCta={home.heroSecondaryCta}
        secondaryHref={home.heroSecondaryHref}
        imageUrl={home.heroImageUrl}
        imageAlt={site.siteName}
        photoMain={home.heroPhotoMain}
        photoMainAlt={home.heroPhotoMainAlt}
        photoA={home.heroPhotoA}
        photoB={home.heroPhotoB}
        backgroundUrl={home.heroBackgroundUrl}
        scrollLabel={home.heroScrollLabel}
      />

      <section id="proyectos" className="relative scroll-mt-20 overflow-hidden bg-crema py-24 sm:py-32">
        <SectionHeading eyebrow={home.projectsEyebrow} title={home.projectsTitle} subtitle={home.projectsSubtitle} className="px-4" />
        <div className="mt-16 px-4 sm:px-6 lg:px-8">
          <DoorCards projects={projects} cta={projectsPage.doorCta} />
        </div>
        <p className="mt-10 text-center text-sm text-tinta-suave">
          <span className="hidden sm:inline">{home.projectsHintDesktop}</span>
          <span className="sm:hidden">{home.projectsHintMobile}</span>
        </p>
      </section>

      <section className="overflow-hidden bg-papel py-24 sm:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:px-8">
          {home.missionImageUrl && (
            <Reveal className="relative order-last lg:order-first">
              <div className="absolute -top-6 -left-6 size-40 rounded-full bg-lavanda-100 blur-2xl" aria-hidden />
              <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] shadow-[var(--shadow-flor)] lg:aspect-[4/5]">
                <Image src={home.missionImageUrl} alt={home.missionImageAlt} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
              </div>
              <Image
                src="/images/flower-1-lg.webp"
                alt=""
                width={160}
                height={160}
                className="absolute -right-6 -bottom-8 w-28 rotate-12 drop-shadow-md sm:w-36"
                aria-hidden
              />
            </Reveal>
          )}
          <div className="grid gap-10">
            <Reveal>
              <p className="eyebrow text-rosa-500">{home.missionLabel}</p>
              <p className="mt-4 font-serif text-2xl leading-snug text-tinta sm:text-3xl">{about.mission}</p>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="eyebrow text-lavanda-600">{home.visionLabel}</p>
              <p className="mt-4 text-base leading-relaxed text-tinta-suave sm:text-lg">{about.vision}</p>
              {home.valuesButton && (
                <Link href="/nosotros" className={buttonClasses("outline", "md", "mt-8")}>
                  {home.valuesButton} <ArrowRight className="size-4" aria-hidden />
                </Link>
              )}
            </Reveal>
          </div>
        </div>
      </section>

      {home.stats.length > 0 && (
        <section className="bg-noche py-20 text-white sm:py-24" aria-labelledby="impacto">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 id="impacto" className="text-center font-serif text-3xl sm:text-4xl">
              {home.statsTitle}
            </h2>
            <dl className="mt-12 grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4">
              {home.stats.map((s, i) => (
                <Reveal key={i} delay={i * 0.08} className="flex flex-col-reverse gap-2">
                  <dt className="text-sm tracking-wide text-white/75">{s.label}</dt>
                  <dd className="font-serif text-5xl text-rosa-200">{s.value}</dd>
                </Reveal>
              ))}
            </dl>
          </div>
        </section>
      )}

      <Presentation
        eyebrow={about.presentationEyebrow}
        name={about.directorName}
        role={about.directorRole}
        message={about.directorMessage}
        videoUrl={about.directorVideoUrl}
        imageUrl={about.directorImageUrl}
      />

      {home.gallery.filter((g) => g.image).length > 0 && (
        <section className="bg-papel py-24 sm:py-28">
          <SectionHeading eyebrow={home.galleryEyebrow} title={home.galleryTitle} subtitle={home.gallerySubtitle} className="px-4" />
          <div className="mt-14">
            <PhotoGallery
              photos={home.gallery
                .filter((g) => g.image)
                .map((g) => ({ image: g.image, alt: g.alt ?? "", caption: g.caption }))}
            />
          </div>
        </section>
      )}

      {events.length > 0 && (
        <section className="bg-crema py-24 sm:py-28">
          <SectionHeading eyebrow={home.activitiesEyebrow} title={home.activitiesTitle} subtitle={home.activitiesSubtitle} className="px-4" />
          <ul className="mx-auto mt-14 grid max-w-7xl gap-6 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-3 lg:px-8">
            {events.map((e, i) => (
              <li key={e.id}>
                <Reveal delay={i * 0.1} className="h-full">
                  <EventCard event={e} labels={activities} />
                </Reveal>
              </li>
            ))}
          </ul>
          <div className="mt-10 text-center">
            <Link href="/actividades" className={buttonClasses("outline", "md")}>
              {home.activitiesButton} <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </section>
      )}

      {home.testimonials.length > 0 && (
        <section className="bg-papel py-24 sm:py-28">
          <SectionHeading eyebrow={home.testimonialsEyebrow} title={home.testimonialsTitle} className="px-4" />
          <ul className="mx-auto mt-14 grid max-w-7xl gap-6 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-3 lg:px-8">
            {home.testimonials.map((t, i) => (
              <li key={i}>
                <Reveal delay={(i % 3) * 0.1} className="h-full">
                  <figure className="flex h-full flex-col rounded-[var(--radius-card)] border border-borde bg-crema p-7">
                    <Quote className="size-7 text-rosa-500" aria-hidden />
                    <blockquote className="mt-4 flex-1 font-serif text-lg leading-relaxed text-tinta">{t.quote}</blockquote>
                    <figcaption className="mt-6">
                      <span className="block font-semibold text-tinta">{t.author}</span>
                      {t.role && <span className="text-sm text-tinta-suave">{t.role}</span>}
                    </figcaption>
                  </figure>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>
      )}

      <DonationBand
        headline={donation.headline}
        title={donation.title}
        body={donation.body}
        cta={donation.cta}
        imageUrl={donation.heroImageUrl}
        imageAlt={donation.heroImageAlt}
      />
    </>
  );
}
