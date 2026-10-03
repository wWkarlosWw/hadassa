import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";
import { VideoFrame } from "@/modules/site/video-frame";
import { Reveal } from "@/modules/site/reveal";
import { buttonClasses } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import type { Block } from "../schemas";

/** Párrafos separados por línea en blanco; saltos simples se conservan. Sin HTML. */
function Paragraphs({ text, className }: { text: string; className?: string }) {
  return (
    <>
      {text
        .split(/\n\s*\n/)
        .filter((p) => p.trim())
        .map((p, i) => (
          <p key={i} className={cn("whitespace-pre-line", className)}>
            {p}
          </p>
        ))}
    </>
  );
}

function SmartLink({ href, className, children }: { href: string; className: string; children: React.ReactNode }) {
  if (/^(https?:|mailto:|tel:)/i.test(href)) {
    const external = /^https?:/i.test(href);
    return (
      <a href={href} className={className} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href || "/"} className={className}>
      {children}
    </Link>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "heading":
      return block.level === "3" ? (
        <h3 className="font-serif text-2xl text-tinta sm:text-3xl">{block.text}</h3>
      ) : (
        <h2 className="font-serif text-3xl text-tinta sm:text-4xl">{block.text}</h2>
      );
    case "paragraph":
      return (
        <div className="space-y-4 text-lg leading-relaxed text-tinta-suave">
          <Paragraphs text={block.text} />
        </div>
      );
    case "image":
      if (!block.url) return null;
      return (
        <figure>
          <Image src={block.url} alt={block.alt} width={1400} height={900} sizes="(min-width: 768px) 768px, 100vw" className="h-auto w-full rounded-[var(--radius-card)]" />
          {block.caption && <figcaption className="mt-2 text-center text-sm text-tinta-suave">{block.caption}</figcaption>}
        </figure>
      );
    case "quote":
      return (
        <figure className="rounded-[var(--radius-card)] border-l-4 border-rosa bg-rosa-50 px-6 py-6 sm:px-8">
          <Quote className="size-6 text-rosa-500" aria-hidden />
          <blockquote className="mt-3 font-serif text-xl leading-relaxed text-tinta sm:text-2xl">{block.text}</blockquote>
          {block.author && <figcaption className="mt-3 text-sm font-semibold text-vino">— {block.author}</figcaption>}
        </figure>
      );
    case "button":
      if (!block.label) return null;
      return (
        <div>
          <SmartLink href={block.href} className={buttonClasses(block.variant, "lg")}>
            {block.label} <ArrowRight className="size-4" aria-hidden />
          </SmartLink>
        </div>
      );
    case "video":
      return <VideoFrame url={block.url} title={block.title || "Video"} className="rounded-[var(--radius-card)] shadow-lg" />;
    case "columns":
      return (
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div className={cn("space-y-4", block.imageSide === "left" && "md:order-2")}>
            {block.title && <h2 className="font-serif text-3xl text-tinta">{block.title}</h2>}
            <div className="space-y-4 text-lg leading-relaxed text-tinta-suave">
              <Paragraphs text={block.text} />
            </div>
          </div>
          {block.imageUrl && (
            <Image src={block.imageUrl} alt={block.imageAlt} width={900} height={700} sizes="(min-width: 768px) 50vw, 100vw" className="h-auto w-full rounded-[var(--radius-card)]" />
          )}
        </div>
      );
    case "spacer":
      return (
        <div className={cn("flex items-center", { sm: "py-2", md: "py-6", lg: "py-12" }[block.size])} aria-hidden>
          {block.divider && <hr className="w-full border-borde" />}
        </div>
      );
  }
}

export function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-8">
      {blocks.map((b) => (
        <Reveal key={b.id}>
          <BlockView block={b} />
        </Reveal>
      ))}
    </div>
  );
}
