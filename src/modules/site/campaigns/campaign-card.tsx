import Image from "next/image";
import Link from "next/link";
import { Clock, Heart, MapPin } from "lucide-react";
import { buttonClasses } from "@/shared/ui/button";
import { fillTemplate } from "@/modules/cms/definitions";
import { countLabel, daysLeft, progressPercent } from "@/modules/projects/campaign";
import type { ProjectDto } from "@/modules/projects/service";
import { CampaignProgress } from "./campaign-progress";

export interface CampaignCardLabels {
  donationsLabel: string;
  donationsLabelOne?: string;
  daysLeftLabel: string;
  endedLabel: string;
  donateButton: string;
  raisedLabel: string;
  goalLabel: string;
}

export function CampaignCard({ campaign, labels }: { campaign: ProjectDto; labels: CampaignCardLabels }) {
  const href = `/proyectos/${campaign.slug}`;
  const days = daysLeft(campaign.endsAt);
  const pct = progressPercent(campaign.raised, campaign.goal);
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-borde bg-papel shadow-[var(--shadow-suave)] transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-flor)]">
      <div className="relative aspect-[16/10] overflow-hidden" style={{ background: campaign.color }}>
        {campaign.coverUrl ? (
          <Image
            src={campaign.coverUrl}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : campaign.logoUrl ? (
          <Image src={campaign.logoUrl} alt="" fill sizes="33vw" className="object-contain p-10" />
        ) : null}
        {campaign.category && (
          <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-tinta backdrop-blur">
            {campaign.category}
          </span>
        )}
        {campaign.goal ? (
          <span
            className="absolute top-3 right-3 rounded-full px-2.5 py-1 text-xs font-bold text-white shadow"
            style={{ background: campaign.color }}
          >
            {pct}%
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        {campaign.location && (
          <p className="flex items-center gap-1.5 text-xs text-tinta-suave">
            <MapPin className="size-3.5" aria-hidden /> {campaign.location}
          </p>
        )}
        <h3 className="mt-1.5 font-serif text-xl text-tinta">
          {/* El título cubre toda la tarjeta como enlace (patrón de tarjeta clicable) */}
          <Link href={href} className="after:absolute after:inset-0 focus-visible:outline-none">
            {campaign.name}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-tinta-suave">{campaign.tagline}</p>

        <div className="mt-auto pt-5">
          <CampaignProgress
            raised={campaign.raised}
            goal={campaign.goal}
            color={campaign.color}
            raisedLabel={labels.raisedLabel}
            goalLabel={labels.goalLabel}
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-tinta-suave">
            <span>{countLabel(campaign.donationsCount, labels.donationsLabel, labels.donationsLabelOne)}</span>
            {days !== null && (
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5" aria-hidden />
                {days > 0 ? fillTemplate(labels.daysLeftLabel, { n: days }) : labels.endedLabel}
              </span>
            )}
          </div>
          {campaign.acceptsDonations && (
            <Link href={`/donar/${campaign.slug}`} className={buttonClasses("vino", "md", "relative z-10 mt-4 w-full")}>
              <Heart className="size-4 fill-current" aria-hidden /> {labels.donateButton}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
