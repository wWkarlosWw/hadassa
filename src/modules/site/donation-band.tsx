import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Reveal } from "./reveal";

/** Tarjeta rosada sobre la foto de niños (maqueta, pág. 15). */
export function DonationBand({
  headline,
  title,
  body,
  cta,
  imageUrl,
  imageAlt = "",
  href = "/donar",
  ctaHref,
}: {
  headline: string;
  title: string;
  body: string;
  cta: string;
  imageUrl: string;
  imageAlt?: string;
  href?: string;
  ctaHref?: string;
}) {
  return (
    <section className="relative isolate overflow-hidden">
      <Image src={imageUrl || "/images/ninos-leyendo.webp"} alt={imageAlt} fill sizes="100vw" className="-z-10 object-cover" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/30 to-transparent" aria-hidden />
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <Reveal className="max-w-xl rounded-[2rem] bg-rosa p-7 shadow-2xl backdrop-blur-sm sm:p-10">
          <p className="font-sans text-2xl font-light text-vino-700 sm:text-3xl">{headline}</p>
          <h2 className="mt-1 font-sans text-5xl font-bold tracking-tight text-vino-700 sm:text-6xl">{title}</h2>
          <p className="mt-5 text-[0.95rem] leading-relaxed text-vino-700">{body}</p>
          <hr className="my-7 border-vino/25" />
          <Link
            href={ctaHref ?? href}
            className="group inline-flex w-full items-center justify-between gap-4 rounded-2xl bg-[#7a5a94] py-3 pl-6 pr-3 text-base font-medium text-white shadow-lg transition hover:bg-[#684b80] sm:text-lg"
          >
            {cta}
            <span className="grid size-10 place-items-center rounded-full bg-white text-[#7a5a94] transition group-hover:translate-x-1">
              <ChevronRight className="size-5" aria-hidden />
            </span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
