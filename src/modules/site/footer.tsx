import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { getSection } from "@/modules/cms/service";
import { getMenu } from "@/modules/menu/service";

function SocialIcon({ name }: { name: string }) {
  // Íconos simples (lucide no incluye marcas).
  const paths: Record<string, string> = {
    facebook: "M14 8h3V4h-3c-2.8 0-5 2.2-5 5v2H6v4h3v9h4v-9h3l1-4h-4V9c0-.6.4-1 1-1z",
    instagram:
      "M12 7.3A4.7 4.7 0 1 0 12 16.7 4.7 4.7 0 0 0 12 7.3zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm6-7.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0zM7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9z",
    tiktok: "M16 3c.4 2.3 1.9 3.8 4 4v3.3c-1.5 0-2.9-.4-4-1.2V15a6 6 0 1 1-6-6h.5v3.4A2.6 2.6 0 1 0 12.6 15V3H16z",
    youtube:
      "M22 8.2c-.2-1.6-1-2.6-2.6-2.8C16.9 5 12 5 12 5s-4.9 0-7.4.4C3 5.6 2.2 6.6 2 8.2 1.8 9.5 1.8 12 1.8 12s0 2.5.2 3.8c.2 1.6 1 2.6 2.6 2.8C7.1 19 12 19 12 19s4.9 0 7.4-.4c1.6-.2 2.4-1.2 2.6-2.8.2-1.3.2-3.8.2-3.8s0-2.5-.2-3.8zM10 15V9l5.2 3L10 15z",
  };
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
      <path d={paths[name]} />
    </svg>
  );
}

export async function Footer() {
  const [contact, site, links] = await Promise.all([getSection("contact"), getSection("site"), getMenu("FOOTER")]);
  const socials = (["facebook", "instagram", "tiktok", "youtube"] as const).filter((k) => contact[k]);
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 overflow-hidden bg-[#19171c] text-white/80">
      {/* Ola superior, como en la maqueta */}
      <svg viewBox="0 0 1440 80" className="block w-full fill-crema" preserveAspectRatio="none" aria-hidden>
        <path d="M0 0h1440v20C1100 80 380 -10 0 60z" />
      </svg>
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-10 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <Image src={site.logoWhiteUrl || "/brand/logo-white.webp"} alt={site.siteName} width={120} height={120} className="size-28" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/70">
              {site.footerText}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">
              {site.subBrands
                .filter((b) => b.image)
                .map((b) => (
                  <Image key={b.image} src={b.image} alt={b.name} width={150} height={48} className="h-12 w-auto opacity-90" />
                ))}
            </div>
          </div>

          <nav aria-label="Pie de página">
            <p className="eyebrow mb-4 text-rosa-300">{site.footerExploreTitle}</p>
            <ul className="grid grid-cols-2 gap-2 text-sm">
              {links.map((l) => (
                <li key={`${l.href}-${l.label}`}>
                  {l.newTab || /^https?:\/\//.test(l.href) ? (
                    <a href={l.href} target={l.newTab ? "_blank" : undefined} rel={l.newTab ? "noopener noreferrer" : undefined} className="transition hover:text-rosa-300">
                      {l.label}
                    </a>
                  ) : (
                    <Link href={l.href} className="transition hover:text-rosa-300">
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="eyebrow mb-4 text-rosa-300">{site.footerContactTitle}</p>
            <ul className="space-y-3 text-sm">
              {contact.phone && (
                <li className="flex items-center gap-3">
                  <Phone className="size-4 text-rosa-300" aria-hidden />
                  <a href={`tel:${contact.phone}`} className="hover:text-rosa-300">{contact.phone}</a>
                </li>
              )}
              {contact.whatsapp && (
                <li className="flex items-center gap-3">
                  <MessageCircle className="size-4 text-rosa-300" aria-hidden />
                  <a href={`https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="hover:text-rosa-300">
                    {site.whatsappLabel}
                  </a>
                </li>
              )}
              {contact.email && (
                <li className="flex items-center gap-3">
                  <Mail className="size-4 text-rosa-300" aria-hidden />
                  <a href={`mailto:${contact.email}`} className="break-all hover:text-rosa-300">{contact.email}</a>
                </li>
              )}
              {contact.address && (
                <li className="flex items-center gap-3">
                  <MapPin className="size-4 text-rosa-300" aria-hidden />
                  {contact.address}
                </li>
              )}
            </ul>
            {socials.length > 0 && (
              <ul className="mt-6 flex gap-2">
                {socials.map((s) => (
                  <li key={s}>
                    <a
                      href={contact[s]}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s}
                      className="grid size-9 place-items-center rounded-full bg-white/10 transition hover:bg-rosa hover:text-vino-700"
                    >
                      <SocialIcon name={s} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:justify-between">
          <p>
            © {year} {site.copyright}
          </p>
          {site.footerVerse && <p className="font-script text-base text-rosa-300">{site.footerVerse}</p>}
        </div>
      </div>
    </footer>
  );
}
