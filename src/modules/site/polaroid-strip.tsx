import Image from "next/image";
import { Reveal } from "./reveal";
import { cn } from "@/shared/lib/utils";

export type StripPhoto = { image?: string; alt?: string; caption?: string };

const TILT = ["-rotate-3", "rotate-2", "-rotate-1", "rotate-3", "-rotate-2"];

/** Fotos tipo polaroid que aparecen como pop-ups al hacer scroll. */
export function PolaroidStrip({ photos, className }: { photos: StripPhoto[]; className?: string }) {
  const items = photos.filter((p): p is StripPhoto & { image: string } => Boolean(p.image));
  if (items.length === 0) return null;
  return (
    <ul className={cn("mx-auto grid max-w-6xl grid-cols-2 gap-5 px-4 sm:gap-7 sm:px-6 md:grid-cols-4 lg:px-8", className)}>
      {items.map((p, i) => (
        <li key={`${p.image}-${i}`}>
          <Reveal pop delay={i * 0.1}>
            <figure
              className={cn(
                "rounded-xl bg-white p-2.5 pb-3 shadow-[var(--shadow-flor)] transition duration-300 hover:z-10 hover:rotate-0 hover:scale-[1.04] sm:p-3",
                TILT[i % TILT.length],
              )}
            >
              <div className="relative aspect-square overflow-hidden rounded-lg bg-rosa-100">
                <Image src={p.image} alt={p.alt ?? ""} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
              </div>
              {p.caption && <figcaption className="mt-2.5 text-center font-script text-xl text-vino sm:text-2xl">{p.caption}</figcaption>}
            </figure>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
