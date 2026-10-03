"use client";

import { useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z" />
    </svg>
  );
}
function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
      <path d="M13.5 22v-8.2h2.8l.4-3.2h-3.2V8.5c0-.9.3-1.6 1.6-1.6h1.7V4.1a22 22 0 0 0-2.5-.1c-2.5 0-4.2 1.5-4.2 4.3v2.3H7.3v3.2h2.8V22h3.4Z" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor" aria-hidden>
      <path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8L17.8 3Zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5Z" />
    </svg>
  );
}

/** Compartir campaña: WhatsApp, Facebook, X, copiar enlace y compartir nativo. */
export function ShareButtons({ url, text, label, className }: { url: string; text: string; label: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;
  const links = [
    { name: "WhatsApp", href: `https://wa.me/?text=${enc(`${text} ${url}`)}`, icon: <WhatsAppIcon />, bg: "#25D366" },
    { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`, icon: <FacebookIcon />, bg: "#1877F2" },
    { name: "X", href: `https://x.com/intent/post?text=${enc(text)}&url=${enc(url)}`, icon: <XIcon />, bg: "#111111" },
  ];

  async function nativeShare() {
    try {
      await navigator.share({ title: text, url });
    } catch {
      /* cancelado o no disponible */
    }
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className="mr-1 inline-flex items-center gap-1.5 text-sm font-medium text-tinta">
        <Share2 className="size-4" aria-hidden /> {label}
      </span>
      {links.map((l) => (
        <a
          key={l.name}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="grid size-9 place-items-center rounded-full text-white transition hover:scale-110"
          style={{ background: l.bg }}
          aria-label={`${label} en ${l.name}`}
        >
          {l.icon}
        </a>
      ))}
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          } catch {
            /* sin portapapeles */
          }
        }}
        className="grid size-9 place-items-center rounded-full border border-borde bg-papel text-tinta transition hover:border-rosa"
        aria-label={copied ? "Enlace copiado" : "Copiar enlace"}
        title={copied ? "¡Copiado!" : "Copiar enlace"}
      >
        {copied ? <Check className="size-4 text-exito" aria-hidden /> : <Link2 className="size-4" aria-hidden />}
      </button>
      <button
        type="button"
        onClick={nativeShare}
        className="grid size-9 place-items-center rounded-full border border-borde bg-papel text-tinta transition hover:border-rosa sm:hidden"
        aria-label={`${label} con otra app`}
      >
        <Share2 className="size-4" aria-hidden />
      </button>
    </div>
  );
}
