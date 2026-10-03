import Image from "next/image";
import { Reveal } from "./reveal";

export interface GalleryPhoto {
  image: string;
  alt: string;
  caption?: string;
}

// Patrón de mosaico (bloques de 6 que llenan 4×3 sin huecos).
const SPANS = [
  "md:col-span-2 md:row-span-2",
  "",
  "md:row-span-2",
  "",
  "md:col-span-2",
  "md:col-span-2",
];

/** Galería en mosaico con zoom suave al pasar el cursor. */
export function PhotoGallery({ photos }: { photos: GalleryPhoto[] }) {
  return (
    <ul className="mx-auto grid max-w-7xl auto-rows-[11rem] grid-cols-2 gap-3 px-4 sm:auto-rows-[14rem] sm:gap-4 sm:px-6 md:grid-cols-4 lg:px-8">
      {photos.map((p, i) => (
        <li key={`${p.image}-${i}`} className={SPANS[i % SPANS.length]}>
          <Reveal delay={(i % 4) * 0.08} className="h-full">
            <figure className="group relative h-full overflow-hidden rounded-2xl bg-rosa-100 shadow-[var(--shadow-suave)]">
              <Image
                src={p.image}
                alt={p.alt}
                fill
                sizes="(min-width: 768px) 50vw, 50vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              {p.caption && (
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-noche-900/75 via-noche-900/20 to-transparent px-4 pt-10 pb-3 font-serif text-base text-white sm:text-lg">
                  {p.caption}
                </figcaption>
              )}
            </figure>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
