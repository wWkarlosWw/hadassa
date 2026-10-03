import Image from "next/image";

/** Cabecera simple para páginas internas del sitio. */
export function PageHero({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <section className="relative overflow-hidden bg-crema pb-14 pt-36 sm:pb-20 sm:pt-44">
      <Image src="/images/branch.webp" alt="" width={700} height={560} className="absolute -right-24 -top-10 w-64 rotate-180 opacity-70 sm:w-96" aria-hidden />
      <Image src="/images/flower-2-lg.webp" alt="" width={520} height={520} className="absolute -bottom-16 -left-10 w-40 opacity-80 sm:w-56" aria-hidden />
      <div className="relative mx-auto max-w-3xl px-4 text-center">
        {eyebrow && <p className="eyebrow rule-under mb-6 inline-block text-malva">{eyebrow}</p>}
        <h1 className=" font-serif text-5xl text-tinta sm:text-6xl">{title}</h1>
        {subtitle && <p className="mt-5 text-lg leading-relaxed text-tinta-suave">{subtitle}</p>}
      </div>
    </section>
  );
}
