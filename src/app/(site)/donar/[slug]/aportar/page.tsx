import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getProjectBySlug } from "@/modules/projects/service";
import { getCurrentUser } from "@/modules/auth/session";
import { DonationWizard } from "@/modules/site/campaigns/donation-wizard";
import { getWizardData } from "@/modules/site/campaigns/wizard-data";

export async function generateMetadata(props: PageProps<"/donar/[slug]/aportar">): Promise<Metadata> {
  const { slug } = await props.params;
  const project = await getProjectBySlug(slug);
  return project ? { title: `Donar a ${project.name}`, description: project.tagline, robots: { index: false } } : {};
}

export default async function AportarPage(props: PageProps<"/donar/[slug]/aportar">) {
  const { slug } = await props.params;
  const sp = await props.searchParams;
  const [project, data, user] = await Promise.all([getProjectBySlug(slug), getWizardData(), getCurrentUser()]);
  if (!project) notFound();

  // Al volver del login el donante puede haber cambiado de proyecto (?proyecto=).
  const chosen = typeof sp.proyecto === "string" ? data.projects.find((p) => p.slug === sp.proyecto) : undefined;
  const initial = chosen ?? data.projects.find((p) => p.id === project.id);

  return (
    <section className="min-h-dvh bg-crema pt-28 pb-24 sm:pt-36">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Link href={`/donar/${project.slug}`} className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-tinta-suave hover:text-tinta">
          <ArrowLeft className="size-4" aria-hidden /> {project.name}
        </Link>
        {initial ? (
          <DonationWizard
            projects={data.projects}
            initialProjectId={initial.id}
            labels={data.labels}
            bank={data.bank}
            qrImageUrl={data.qrImageUrl}
            qrPayload={data.qrPayload}
            pointsPerBoliviano={data.pointsPerBoliviano}
            minDonation={data.minDonation}
            events={data.events}
            isLoggedIn={Boolean(user)}
            returnPath={`/donar/${project.slug}/aportar`}
            siteUrl={data.siteUrl}
          />
        ) : (
          <p className="rounded-[var(--radius-card)] border border-borde bg-papel p-8 text-tinta-suave">{data.closedNotice}</p>
        )}
      </div>
    </section>
  );
}
