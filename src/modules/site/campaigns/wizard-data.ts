import "server-only";
import { getSection } from "@/modules/cms/service";
import { listPublicProjects } from "@/modules/projects/service";
import { listUpcomingEvents } from "@/modules/events/service";
import type { WizardLabels, WizardProject } from "./donation-wizard";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * Datos del flujo de donación (compartido por /donar/[slug]/aportar y
 * /panel/donar). La fundación principal va primero.
 */
export async function getWizardData() {
  const [c, d, site, page, gamification, projects, events] = await Promise.all([
    getSection("campaigns"),
    getSection("donation"),
    getSection("site"),
    getSection("projectsPage"),
    getSection("gamification"),
    listPublicProjects(),
    listUpcomingEvents(50),
  ]);

  const open: WizardProject[] = projects
    .filter((p) => p.acceptsDonations)
    .map((p) => ({ id: p.id, slug: p.slug, name: p.name, color: p.color, coverUrl: p.coverUrl, isMain: p.isMain, raised: p.raised, goal: p.goal }));

  const labels: WizardLabels = {
    ...c,
    quickTitle: d.quickTitle,
    raisedLabel: page.raisedLabel,
    goalLabel: page.goalLabel,
  };

  const bank = [
    { label: d.bankLabel, value: d.bankName },
    { label: d.accountLabel, value: d.accountNumber, copy: true },
    { label: d.holderLabel, value: d.accountHolder, copy: true },
    { label: d.typeLabel, value: d.accountType },
    { label: d.holderIdLabel, value: d.holderId, copy: true },
  ].filter((r) => r.value);

  return {
    projects: open,
    labels,
    bank,
    qrImageUrl: d.qrImageUrl,
    qrPayload: `${site.siteName} | ${d.bankName} | Cuenta ${d.accountNumber} | Titular ${d.accountHolder}`,
    pointsPerBoliviano: gamification.pointsPerBoliviano,
    minDonation: gamification.minDonation,
    events: events.map((e) => ({ id: e.id, title: e.title, startsAt: e.startsAt.toISOString(), projectId: e.projectId })),
    siteUrl: SITE_URL,
    closedNotice: c.closedNotice,
  };
}
