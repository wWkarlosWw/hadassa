import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Landmark, QrCode as QrIcon, Sparkles } from "lucide-react";
import { getSection } from "@/modules/cms/service";
import { getProjectBySlug, listCampaigns } from "@/modules/projects/service";
import { CampaignCard } from "@/modules/site/campaigns/campaign-card";
import { getCurrentUser } from "@/modules/auth/session";
import { DonationBand } from "@/modules/site/donation-band";
import { CopyButton } from "@/modules/site/copy-button";
import { QrCode } from "@/modules/site/qr-code";
import { Reveal } from "@/modules/site/reveal";
import { GoalProgress } from "@/modules/site/progress";
import { buttonClasses } from "@/shared/ui/button";
import { seoMetadata } from "@/modules/site/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return seoMetadata(await getSection("donation"));
}

export default async function DonarPage(props: PageProps<"/donar">) {
  const sp = await props.searchParams;
  const slug = typeof sp.proyecto === "string" ? sp.proyecto : undefined;
  const [d, site, projectsPage, c, project, user, campaigns] = await Promise.all([
    getSection("donation"),
    getSection("site"),
    getSection("projectsPage"),
    getSection("campaigns"),
    slug ? getProjectBySlug(slug) : Promise.resolve(null),
    getCurrentUser(),
    listCampaigns(),
  ]);

  // Con campaña elegida va directo al flujo paso a paso (pide sesión solo al registrar).
  const registerPath = project ? `/donar/${project.slug}` : "/panel/donar";
  const registerHref = user || project ? registerPath : `/ingresar?next=${encodeURIComponent(registerPath)}`;
  const openCampaigns = campaigns.filter((p) => p.acceptsDonations);

  const bank = [
    { label: d.bankLabel, value: d.bankName },
    { label: d.accountLabel, value: d.accountNumber, copy: true },
    { label: d.holderLabel, value: d.accountHolder, copy: true },
    { label: d.typeLabel, value: d.accountType },
    { label: d.holderIdLabel, value: d.holderId, copy: true },
  ].filter((r) => r.value);

  const goalLabels = { raised: projectsPage.raisedLabel, goal: projectsPage.goalLabel, percent: projectsPage.goalPercentLabel };
  const qrPayload = `${site.siteName} | ${d.bankName} | Cuenta ${d.accountNumber} | Titular ${d.accountHolder}`;

  return (
    <>
      <div className="pt-20">
        <DonationBand
          headline={d.headline}
          title={d.title}
          body={d.body}
          cta={d.cta}
          imageUrl={d.heroImageUrl}
          imageAlt={d.heroImageAlt}
          href="#donar-qr"
        />
      </div>

      {project && (
        <section className="border-b border-borde bg-papel">
          <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 sm:flex-row sm:items-center sm:px-6">
            <div className="flex items-center gap-4">
              <span className="size-12 shrink-0 rounded-full" style={{ background: project.color }} aria-hidden />
              <div>
                <p className="eyebrow text-[0.65rem] text-tinta-suave">{d.supportingLabel}</p>
                <p className="font-serif text-2xl text-tinta">{project.name}</p>
              </div>
            </div>
            <div className="flex-1 sm:max-w-sm sm:pl-6">
              <GoalProgress raised={project.raised} goal={project.goal} color={project.color} labels={goalLabels} />
            </div>
          </div>
        </section>
      )}

      {/* El sobre con el sello de Hadassa: QR a un lado, cuenta al otro */}
      <section className="relative overflow-hidden bg-crema py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <p className="eyebrow rule-under inline-block text-malva">{d.envelopeEyebrow}</p>
          <h2 className="mt-6 font-serif text-4xl text-tinta sm:text-5xl">{d.envelopeTitle}</h2>
        </div>
        <div className="mx-auto mt-12 grid max-w-5xl items-center gap-6 px-4 sm:px-6 md:grid-cols-[1fr_1.4fr_1fr]">
          <Reveal className="order-2 md:order-1">
            <a href="#donar-qr" className="group flex flex-col items-center gap-3 rounded-3xl p-4 text-center transition hover:bg-papel">
              <span className="grid size-16 place-items-center rounded-full bg-lavanda-100 text-lavanda-700">
                <QrIcon className="size-7" aria-hidden />
              </span>
              <span className="flex items-center gap-2 font-semibold text-tinta">
                <ArrowLeft className="hidden size-4 transition group-hover:-translate-x-1 md:block" aria-hidden /> {d.qrOptionTitle}
              </span>
              <span className="text-sm text-tinta-suave">{d.qrOptionText}</span>
            </a>
          </Reveal>
          <Reveal pop className="order-1 md:order-2">
            <div className="relative mx-auto max-w-sm">
              <Image src={d.envelopeImageUrl || "/images/sobre.webp"} alt="" width={900} height={700} className="h-auto w-full mix-blend-multiply" />
              <div className="absolute left-1/2 top-1/2 w-[34%] -translate-x-1/2 -translate-y-[42%] rounded-full bg-white p-1.5 shadow-lg">
                <Image src={site.logoUrl || "/brand/logo.webp"} alt={site.siteName} width={200} height={200} className="h-auto w-full" />
              </div>
            </div>
          </Reveal>
          <Reveal className="order-3" delay={0.1}>
            <a href="#donar-qr" className="group flex flex-col items-center gap-3 rounded-3xl p-4 text-center transition hover:bg-papel">
              <span className="grid size-16 place-items-center rounded-full bg-rosa-100 text-vino">
                <Landmark className="size-7" aria-hidden />
              </span>
              <span className="flex items-center gap-2 font-semibold text-tinta">
                {d.bankOptionTitle} <ArrowRight className="hidden size-4 transition group-hover:translate-x-1 md:block" aria-hidden />
              </span>
              <span className="text-sm text-tinta-suave">{d.bankOptionText}</span>
            </a>
          </Reveal>
        </div>
      </section>

      {/* QR + cuenta sobre la foto de tiza (maqueta, pág. 16) */}
      <section id="donar-qr" className="relative isolate scroll-mt-20 overflow-hidden py-20 sm:py-28">
        <Image src={d.qrBackgroundUrl || "/images/tiza.webp"} alt="" fill sizes="100vw" className="-z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-noche-900/20" aria-hidden />
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Reveal>
            <div className="grid overflow-hidden rounded-[2rem] shadow-2xl md:grid-cols-[0.9fr_1.1fr]">
              <div className="flex flex-col items-center justify-center gap-4 bg-[#ececec] p-8">
                {d.qrImageUrl ? (
                  <Image src={d.qrImageUrl} alt={`${d.qrOptionTitle} — ${site.siteName}`} width={320} height={320} className="h-auto w-full max-w-64 rounded-xl" />
                ) : (
                  <>
                    <div className="w-full max-w-60">
                      <QrCode value={qrPayload} />
                    </div>
                    <p className="rounded-full bg-alerta-50 px-3 py-1 text-xs font-medium text-alerta">{d.qrPlaceholderNote}</p>
                  </>
                )}
              </div>
              <div className="bg-papel">
                <p className="bg-rosa px-7 py-6 text-lg leading-snug text-vino-700 sm:text-xl">{d.quickTitle}</p>
                <div className="px-7 py-7">
                  <p className="font-semibold text-tinta">{d.accountIntro}</p>
                  <dl className="mt-4 divide-y divide-borde">
                    {bank.map((r) => (
                      <div key={r.label} className="flex items-center justify-between gap-3 py-2.5">
                        <dt className="text-sm text-tinta-suave">{r.label}</dt>
                        <dd className="flex min-w-0 items-center gap-1 text-right font-medium text-tinta">
                          <span className="truncate">{r.value}</span>
                          {r.copy && <CopyButton value={r.value} label={r.label.toLowerCase()} />}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {!project && openCampaigns.length > 0 && (
        <section className="bg-crema py-20" aria-labelledby="elige-campana">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 id="elige-campana" className="text-center font-serif text-3xl text-tinta sm:text-4xl">
              {c.featuredTitle}
            </h2>
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {openCampaigns.map((p) => (
                <li key={p.id}>
                  <CampaignCard
                    campaign={p}
                    labels={{
                      donationsLabel: c.donationsLabel,
                      donationsLabelOne: c.donationsLabelOne,
                      daysLeftLabel: c.daysLeftLabel,
                      endedLabel: c.endedLabel,
                      donateButton: c.donateButton,
                      raisedLabel: projectsPage.raisedLabel,
                      goalLabel: projectsPage.goalLabel,
                    }}
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="bg-papel py-20">
        <Reveal className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 text-center sm:px-6">
          <span className="grid size-14 place-items-center rounded-full bg-lavanda-100 text-lavanda-700">
            <Sparkles className="size-6" aria-hidden />
          </span>
          <h2 className="font-serif text-3xl text-tinta sm:text-4xl">{d.registerTitle}</h2>
          <p className="max-w-2xl text-tinta-suave">{d.registerText}</p>
          <Link href={registerHref} className={buttonClasses("primary", "lg")}>
            {d.registerCta} <ArrowRight className="size-4" aria-hidden />
          </Link>
          {!user && (
            <p className="text-sm text-tinta-suave">
              {d.registerNoAccount}{" "}
              <Link href="/registro" className="font-semibold text-lavanda-700 underline-offset-4 hover:underline">
                {d.registerSignupLink}
              </Link>
            </p>
          )}
        </Reveal>
      </section>
    </>
  );
}
