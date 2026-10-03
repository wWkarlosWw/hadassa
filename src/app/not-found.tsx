import Image from "next/image";
import { LinkButton } from "@/shared/ui/button";
import { getSectionSafe } from "@/modules/cms/service";

export default async function NotFound() {
  const t = await getSectionSafe("notFound");
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-crema px-6 text-center">
      <Image src="/images/petal-lg.webp" alt="" width={600} height={600} className="absolute -right-20 -top-10 w-64 opacity-60" aria-hidden />
      <Image src="/images/flower-2-lg.webp" alt="" width={520} height={520} className="absolute -bottom-16 -left-16 w-56 opacity-70" aria-hidden />
      <Image src="/brand/sello-tallo.webp" alt="" width={110} height={110} className="relative mb-6" />
      <p className="eyebrow text-malva">{t.eyebrow}</p>
      <h1 className="relative mt-3 font-serif text-5xl text-tinta">{t.title}</h1>
      <p className="relative mt-4 max-w-md text-tinta-suave">{t.text}</p>
      <LinkButton href="/" size="lg" className="relative mt-8">
        {t.cta}
      </LinkButton>
    </main>
  );
}
