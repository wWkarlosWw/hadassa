import type { Metadata } from "next";
import Image from "next/image";
import { getSection, listCoreValues, listOrgAreas } from "@/modules/cms/service";
import { Presentation } from "@/modules/site/presentation";
import { SectionHeading } from "@/modules/site/section-heading";
import { ValuesTree } from "@/modules/site/values-tree";
import { OrgChart } from "@/modules/site/org-chart";
import { PolaroidStrip } from "@/modules/site/polaroid-strip";
import { FallingPetals } from "@/modules/site/falling-petals";
import { Reveal } from "@/modules/site/reveal";
import { seoMetadata } from "@/modules/site/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return seoMetadata(await getSection("about"));
}

export default async function NosotrosPage() {
  const [about, values, areas] = await Promise.all([getSection("about"), listCoreValues(), listOrgAreas()]);

  return (
    <>
      <section className="relative overflow-hidden bg-crema pb-20 pt-36 sm:pt-44">
        <Image src="/images/flower-1-lg.webp" alt="" width={520} height={520} className="absolute -right-16 top-24 w-44 opacity-80 sm:w-64" aria-hidden />
        <Image src="/images/branch.webp" alt="" width={700} height={560} className="absolute -left-20 bottom-0 w-56 opacity-60 sm:w-80" aria-hidden />
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <p className="eyebrow rule-under inline-block text-malva">{about.heroEyebrow}</p>
          <h1 className="mt-6 font-serif text-5xl text-tinta sm:text-6xl">{about.aboutTitle}</h1>
          <p className="mt-6 text-lg leading-relaxed text-tinta-suave">{about.aboutText}</p>
        </div>
        <PolaroidStrip photos={about.photos} className="relative mt-16" />
      </section>

      <Presentation
        eyebrow={about.presentationEyebrow}
        name={about.directorName}
        role={about.directorRole}
        message={about.directorMessage}
        videoUrl={about.directorVideoUrl}
        imageUrl={about.directorImageUrl}
      />

      <section className="bg-papel py-20 sm:py-28" aria-labelledby="mision-vision">
        <h2 id="mision-vision" className="sr-only">
          {about.missionLabel} · {about.visionLabel}
        </h2>
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          {[
            { label: about.visionLabel, text: about.vision },
            { label: about.missionLabel, text: about.mission },
          ].map((b, i) => (
            <Reveal key={b.label} delay={i * 0.12} className="grid gap-4 sm:grid-cols-[8rem_1fr] sm:items-center">
              <p className="eyebrow text-base tracking-[0.25em] text-rosa-700">{b.label}</p>
              <p className="leading-relaxed text-tinta-suave sm:text-[1.05rem]">{b.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-b from-[#eaf2fb] via-crema to-crema py-24 sm:py-28">
        <FallingPetals count={22} />
        <div className="relative">
          <SectionHeading eyebrow={about.valuesEyebrow} title={about.valuesTitle} subtitle={about.valuesSubtitle} className="px-4" />
          <div className="mx-auto mt-10 max-w-5xl px-4 sm:px-6">
            <ValuesTree values={values} />
            {about.valuesHint && <p className="mt-6 text-center text-sm text-tinta-suave">{about.valuesHint}</p>}
          </div>
        </div>
      </section>

      {areas.length > 0 && (
        <section className="bg-[#fffaf3] py-24 sm:py-28">
          <SectionHeading eyebrow={about.orgChartEyebrow} title={about.orgChartTitle} className="px-4" />
          <div className="mx-auto mt-12 max-w-4xl px-4 sm:px-6">
            <OrgChart areas={areas} />
          </div>
        </section>
      )}
    </>
  );
}
