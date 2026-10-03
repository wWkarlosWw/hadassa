import Link from "next/link";
import { ArrowRight } from "lucide-react";

/** Barra de anuncio superior configurable desde el CMS. */
export function AnnouncementBar({ text, linkLabel, href }: { text: string; linkLabel: string; href: string }) {
  const external = /^https?:\/\//.test(href);
  return (
    <div className="relative z-[60] bg-vino px-4 py-2 text-center text-sm text-white">
      <p className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1">
        <span>{text}</span>
        {href && linkLabel && (
          <Link
            href={href}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="inline-flex items-center gap-1 font-semibold underline-offset-4 hover:underline"
          >
            {linkLabel} <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        )}
      </p>
    </div>
  );
}
