import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FallingPetals } from "@/modules/site/falling-petals";
import { connection } from "next/server";
import { getSection } from "@/modules/cms/service";
import { listPublicProjects } from "@/modules/projects/service";
import { formatBs, formatNumber } from "@/shared/lib/utils";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  // Textos editables desde el CMS: se renderiza en cada request.
  await connection();
  const [a, site, projects] = await Promise.all([getSection("authPages"), getSection("site"), listPublicProjects()]);
  const raised = projects.reduce((t, p) => t + p.raised, 0);
  const donations = projects.reduce((t, p) => t + p.donationsCount, 0);
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      {/* Panel de marca */}
      <aside className="relative hidden overflow-hidden lg:block">
        <Image src={a.sideImageUrl || "/images/mirto.webp"} alt="" fill priority sizes="50vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-vino-700/95 via-vino-700/75 to-noche-900/60" aria-hidden />
        <FallingPetals count={18} />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Link href="/" className="flex items-center gap-3">
            <Image src={site.logoWhiteUrl || "/brand/logo-white.webp"} alt="" width={64} height={64} className="size-14" />
            <span className="font-script text-3xl">{site.brandScript}</span>
          </Link>
          <div className="max-w-md">
            <p className="font-serif text-4xl leading-tight">{a.sideTitle}</p>
            <ul className="mt-8 space-y-3 text-white/85">
              {a.sideBullets.map((b, i) => (
                <li key={i}>✿ {b.text}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-6">
            {donations > 0 && (
              <dl className="grid grid-cols-3 gap-4 border-t border-white/20 pt-6">
                {[
                  [formatBs(raised), a.statsRaisedLabel],
                  [formatNumber(donations), a.statsDonationsLabel],
                  [formatNumber(projects.filter((p) => p.acceptsDonations).length), a.statsCampaignsLabel],
                ].map(([v, l]) => (
                  <div key={l} className="flex flex-col-reverse">
                    <dt className="text-xs text-white/75">{l}</dt>
                    <dd className="font-serif text-2xl">{v}</dd>
                  </div>
                ))}
              </dl>
            )}
            {a.sideVerse && <p className="font-script text-2xl text-rosa-200">{a.sideVerse}</p>}
          </div>
        </div>
      </aside>

      <div className="relative flex flex-col overflow-hidden bg-crema">
        <Image src="/images/flower-1-lg.webp" alt="" width={520} height={520} className="pointer-events-none absolute -right-14 -top-14 w-40 opacity-70" aria-hidden />
        <div className="px-6 pt-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-tinta-suave hover:text-vino">
            <ArrowLeft className="size-4" aria-hidden /> {a.backLabel}
          </Link>
        </div>
        <main className="relative flex flex-1 items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">{children}</div>
        </main>
      </div>
    </div>
  );
}
