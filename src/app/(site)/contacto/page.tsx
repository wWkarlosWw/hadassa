import type { Metadata } from "next";
import Image from "next/image";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { getSection } from "@/modules/cms/service";
import { PageHero } from "@/modules/site/page-hero";
import { ContactForm } from "@/modules/site/contact-form";
import { buttonClasses } from "@/shared/ui/button";
import { seoMetadata } from "@/modules/site/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return seoMetadata(await getSection("contactPage"));
}

export default async function ContactoPage() {
  const [c, page] = await Promise.all([getSection("contact"), getSection("contactPage")]);
  const items = [
    c.phone && { icon: Phone, label: page.phoneLabel, value: c.phone, href: `tel:${c.phone}` },
    c.email && { icon: Mail, label: page.emailLabel, value: c.email, href: `mailto:${c.email}` },
    c.address && { icon: MapPin, label: page.addressLabel, value: c.address },
  ].filter(Boolean) as { icon: typeof Phone; label: string; value: string; href?: string }[];

  return (
    <>
      <PageHero eyebrow={page.eyebrow} title={page.title} subtitle={page.subtitle} />
      <section className="bg-crema px-4 pb-28 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative overflow-hidden rounded-[2rem] bg-noche p-8 text-white sm:p-10">
            <Image src="/brand/sello-flor.webp" alt="" width={300} height={300} className="absolute -bottom-16 -right-16 w-60 opacity-25" aria-hidden />
            <h2 className="font-serif text-3xl">{page.cardTitle}</h2>
            <p className="mt-2 text-white/75">{page.cardText}</p>
            <ul className="mt-8 space-y-5">
              {items.map(({ icon: Icon, label, value, href }) => (
                <li key={label} className="flex items-start gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white/10">
                    <Icon className="size-5 text-rosa-200" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-xs font-semibold tracking-wider text-white/60 uppercase">{label}</span>
                    {href ? (
                      <a href={href} className="break-all text-lg hover:text-rosa-200">{value}</a>
                    ) : (
                      <span className="text-lg">{value}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            {c.whatsapp && (
              <a
                href={`https://wa.me/${c.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(page.whatsappMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClasses("light", "lg", "relative mt-10")}
              >
                <MessageCircle className="size-5" aria-hidden /> {page.whatsappCta}
              </a>
            )}
          </div>
          <div className="rounded-[2rem] border border-borde bg-papel p-8 shadow-[var(--shadow-suave)] sm:p-10">
            <h2 className="font-serif text-3xl text-tinta">{page.formTitle}</h2>
            <p className="mb-8 mt-2 text-sm text-tinta-suave">{page.formText}</p>
            <ContactForm
              labels={{
                name: page.nameLabel,
                phone: page.phoneFieldLabel,
                email: page.emailFieldLabel,
                message: page.messageLabel,
                submit: page.submitLabel,
              }}
            />
          </div>
        </div>
      </section>
    </>
  );
}
