import Image from "next/image";
import { toEmbedUrl } from "./video";
import { VideoFrame } from "./video-frame";
import { Reveal } from "./reveal";

/**
 * "Presentación": video o foto del árbol de mirto con el mensaje de la
 * directora ejecutiva (maqueta, pág. 9).
 */
export function Presentation({
  eyebrow = "Presentación",
  name,
  role,
  message,
  videoUrl,
  imageUrl,
}: {
  eyebrow?: string;
  name: string;
  role: string;
  message: string;
  videoUrl: string;
  imageUrl: string;
}) {
  const hasVideo = Boolean(toEmbedUrl(videoUrl));
  return (
    <section className="relative isolate overflow-hidden">
      <Image src={imageUrl || "/images/mirto.webp"} alt="" fill sizes="100vw" className="-z-20 object-cover" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-noche-900/85 via-noche-900/60 to-noche-900/20" aria-hidden />
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-32">
        <Reveal>
          <p className="eyebrow rule-under inline-block text-rosa-200 after:left-0 after:translate-x-0">{eyebrow}</p>
          <blockquote className="mt-6 font-serif text-3xl leading-snug text-white sm:text-4xl">“{message}”</blockquote>
          <p className="mt-6 font-script text-4xl text-rosa-200">{name}</p>
          <p className="eyebrow mt-1 text-white/70">{role}</p>
        </Reveal>
        {hasVideo && (
          <Reveal delay={0.15}>
            <VideoFrame url={videoUrl} title={`Presentación de ${name}`} className="rounded-3xl shadow-2xl ring-1 ring-white/20" />
          </Reveal>
        )}
      </div>
    </section>
  );
}
