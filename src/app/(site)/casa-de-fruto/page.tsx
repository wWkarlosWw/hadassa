import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Phone } from "lucide-react";
import { getSection } from "@/modules/cms/service";
import { getProjectBySlug } from "@/modules/projects/service";
import { VideoFrame } from "@/modules/site/video-frame";
import { Reveal } from "@/modules/site/reveal";
import { PolaroidStrip } from "@/modules/site/polaroid-strip";
import { GoalProgress } from "@/modules/site/progress";
import { seoMetadata } from "@/modules/site/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return seoMetadata(await getSection("casaDeFruto"));
}

/** Tarjeta tipo "ventana emergente digital" sobre el aula. */
function PopCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-[0_25px_60px_-25px_rgba(47,42,51,0.45)] backdrop-blur-md sm:p-8 ${className}`}>
      {children}
    </div>
  );
}

export default async function CasaDeFrutoPage() {
  const [c, project, projectsPage, campaigns] = await Promise.all([
    getSection("casaDeFruto"),
    getProjectBySlug("casa-de-fruto"),
    getSection("projectsPage"),
    getSection("campaigns"),
  ]);
  const badgeWords = c.title.split(/\s+/).filter(Boolean);
  const paragraphs = c.body.split(/\n\s*\n/).filter(Boolean);

  return (
    <div className="relative isolate">
      {/* El aula se ve de fondo */}
      <div className="fixed inset-0 -z-10" aria-hidden>
        <Image src={c.backgroundUrl || "/images/aula.webp"} alt="" fill priority sizes="100vw" className="scale-105 object-cover blur-[6px]" />
        <div className="absolute inset-0 bg-[#f7e9df]/55" />
      </div>

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-32 sm:px-6 sm:pt-40 lg:px-8">
        <div className="flex flex-wrap items-center gap-6">
          <Reveal pop>
            <span className="grid size-32 place-items-center rounded-full bg-[#fbcff5] p-4 text-center font-serif text-2xl leading-none text-tinta shadow-lg sm:size-40 sm:text-3xl">
              {badgeWords.map((w, i) => (
                <span key={i} className="block">
                  {w}
                </span>
              ))}
            </span>
          </Reveal>
          <Reveal delay={0.1} className="max-w-md">
            <p className="eyebrow text-tinta">{c.eyebrow}</p>
            <p className="mt-2 text-sm leading-relaxed text-tinta">{c.tagline}</p>
          </Reveal>
        </div>

        <div className="mt-14 grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <h1 className="font-serif text-5xl leading-tight text-tinta sm:text-6xl lg:text-right">{c.question}</h1>
            <Reveal pop delay={0.2} className="mt-6 lg:ml-auto lg:w-fit">
              {c.illustrationRunning && <Image src={c.illustrationRunning} alt="" width={600} height={600} className="w-36 sm:w-44" />}
            </Reveal>
          </Reveal>
          {/* Video en un "monitor" */}
          <Reveal pop delay={0.1}>
            <div className="mx-auto max-w-2xl">
              <div className="rounded-[1.6rem] bg-[#1d1d20] p-3 shadow-2xl sm:p-4">
                <VideoFrame url={c.videoUrl} title={c.question} className="rounded-xl" />
              </div>
              <div className="mx-auto h-10 w-24 bg-gradient-to-b from-[#c9c9cf] to-[#9d9da5] [clip-path:polygon(15%_0,85%_0,100%_100%,0_100%)]" aria-hidden />
              <div className="mx-auto h-2 w-48 rounded-full bg-[#b6b6bd]" aria-hidden />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <Reveal>
              <h2 className="font-serif text-5xl text-tinta sm:text-6xl">{c.teachersTitle}</h2>
              <p className="mt-3 max-w-md text-tinta">{c.teachersText}</p>
            </Reveal>
            <Reveal pop delay={0.15} className="relative mt-10">
              {c.illustrationBlocks && (
                <Image src={c.illustrationBlocks} alt="" width={400} height={600} className="absolute -top-24 right-6 z-10 w-20 sm:w-28" aria-hidden />
              )}
              {/* Tarjeta de video divertida (claqueta) */}
              <div className="relative max-w-lg rotate-[-1.5deg] overflow-hidden rounded-[2.2rem] border-[5px] border-[#2b2630] bg-[#fbeee6] shadow-2xl">
                <div className="flex h-14 border-b-[5px] border-[#2b2630] bg-[#a586c0]">
                  {[0, 1, 2, 3].map((i) => (
                    <span key={i} className="h-full flex-1 border-r-[5px] border-[#2b2630] [transform:skewX(-25deg)]" aria-hidden />
                  ))}
                </div>
                <VideoFrame url={c.teachersVideoUrl} title={c.teachersTitle} placeholder={c.teachersVideoPlaceholder} />
              </div>
            </Reveal>
            <Reveal pop delay={0.3}>
              {c.illustrationPlaying && <Image src={c.illustrationPlaying} alt="" width={700} height={500} className="mt-8 w-56 sm:w-72" />}
            </Reveal>
          </div>

          <div className="space-y-5 lg:pt-6">
            <Reveal pop>
              <PopCard>
                <p className="text-[1.02rem] leading-relaxed text-tinta">{c.intro}</p>
              </PopCard>
            </Reveal>
            {paragraphs.map((p, i) => (
              <Reveal key={i} pop delay={0.08 * (i + 1)}>
                <PopCard className="py-5 sm:py-6">
                  <p className="leading-relaxed text-tinta">{p}</p>
                </PopCard>
              </Reveal>
            ))}
            {project && (
              <Reveal pop delay={0.2}>
                <PopCard>
                  <GoalProgress
                    raised={project.raised}
                    goal={project.goal}
                    color="#a586c0"
                    labels={{ raised: projectsPage.raisedLabel, goal: projectsPage.goalLabel, percent: projectsPage.goalPercentLabel }}
                  />
                  <Link
                    href={`/proyectos/${project.slug}`}
                    className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#7a5a94] underline-offset-4 hover:underline"
                  >
                    {campaigns.viewCampaignLink} <ChevronRight className="size-4" aria-hidden />
                  </Link>
                </PopCard>
              </Reveal>
            )}
            {c.contactPhone && (
              <Reveal pop delay={0.25}>
                <a
                  href={`tel:${c.contactPhone}`}
                  className="flex items-center gap-4 rounded-2xl bg-white/85 p-4 text-tinta shadow-lg backdrop-blur transition hover:bg-white"
                >
                  <span className="grid size-11 place-items-center rounded-full bg-[#fbcff5]">
                    <Phone className="size-5" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-xs font-semibold tracking-wider text-tinta-suave uppercase">{c.contactLabel}</span>
                    <span className="font-serif text-xl">{c.contactPhone}</span>
                  </span>
                </a>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {c.photos.some((p) => p.image) && (
        <section className="py-16">
          {c.photosTitle && (
            <Reveal>
              <h2 className="mb-10 px-4 text-center font-serif text-4xl text-tinta sm:text-5xl">{c.photosTitle}</h2>
            </Reveal>
          )}
          <PolaroidStrip photos={c.photos} />
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-8 sm:flex-row">
          <Reveal pop>
            {c.illustrationGrass && <Image src={c.illustrationGrass} alt="" width={700} height={400} className="w-64 sm:w-80" />}
          </Reveal>
          <Reveal pop delay={0.15}>
            <Link
              href="/donar/casa-de-fruto"
              className="group inline-flex items-center gap-5 rounded-2xl bg-[#7a5a94] py-3.5 pl-7 pr-3.5 text-lg font-medium text-white shadow-xl transition hover:bg-[#684b80]"
            >
              {c.ctaLabel}
              <span className="grid size-10 place-items-center rounded-full bg-white text-[#7a5a94] transition group-hover:translate-x-1">
                <ChevronRight className="size-5" aria-hidden />
              </span>
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
