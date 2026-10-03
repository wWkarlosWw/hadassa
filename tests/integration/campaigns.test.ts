/**
 * Campañas: solo las donaciones APROBADAS cuentan para lo recaudado, el nº de
 * donaciones, la lista pública y las palabras de apoyo. Requiere Supabase local.
 */
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/shared/lib/prisma";
import { approveDonation, createDonation, rejectDonation, setMessageHidden } from "@/modules/donations/service";
import { getCampaign } from "@/modules/projects/service";

const tag = `camp-${Date.now()}`;
const donorId = randomUUID();
const adminId = randomUUID();
let projectId: string;
const slug = `${tag}-campana`;

beforeAll(async () => {
  await prisma.profile.createMany({
    data: [
      { id: donorId, email: `${tag}-d@test.local`, fullName: "Rosa María Test" },
      { id: adminId, email: `${tag}-a@test.local`, fullName: "Admin Test", role: "ADMIN" },
    ],
  });
  projectId = (await prisma.project.create({ data: { slug, name: `${tag} Campaña`, goal: 1000 } })).id;
});

afterAll(async () => {
  await prisma.donation.deleteMany({ where: { projectId } });
  await prisma.project.deleteMany({ where: { id: projectId } });
  await prisma.profile.deleteMany({ where: { id: { in: [donorId, adminId] } } });
  await prisma.$disconnect();
});

describe("estadísticas públicas de una campaña", () => {
  it("solo cuenta donaciones aprobadas y respeta anonimato y moderación", async () => {
    const visible = await createDonation(donorId, { amount: 100, method: "QR", projectId, message: "¡Fuerza!" });
    const anon = await createDonation(donorId, { amount: 50, method: "QR", projectId, isAnonymous: true, message: "Con cariño" });
    const pending = await createDonation(donorId, { amount: 300, method: "QR", projectId, message: "Pendiente" });
    const rejected = await createDonation(donorId, { amount: 700, method: "QR", projectId, message: "Rechazada" });
    const hidden = await createDonation(donorId, { amount: 20, method: "QR", projectId, message: "Spam" });

    await approveDonation(visible.id, adminId);
    await approveDonation(anon.id, adminId);
    await approveDonation(hidden.id, adminId);
    await setMessageHidden(hidden.id, true);
    await rejectDonation(rejected.id, adminId);
    expect(pending.status).toBe("PENDING");

    const data = await getCampaign(slug);
    expect(data).not.toBeNull();
    const { project, recentDonations, supportMessages, topDonors } = data!;

    expect(project.raised).toBe(170);
    expect(project.donationsCount).toBe(3);
    expect(recentDonations.map((d) => d.amount).sort()).toEqual([100, 20, 50].sort());
    expect(recentDonations.find((d) => d.amount === 50)?.name).toBe("Anónimo");
    expect(recentDonations.find((d) => d.amount === 100)?.name).toBe("Rosa M.");

    const msgs = supportMessages.map((m) => m.message);
    expect(msgs).toContain("¡Fuerza!");
    expect(msgs).toContain("Con cariño");
    expect(msgs).not.toContain("Pendiente");
    expect(msgs).not.toContain("Rechazada");
    expect(msgs).not.toContain("Spam");

    // Las anónimas no aparecen en el ranking de donantes.
    expect(topDonors).toEqual([{ name: "Rosa M.", amount: 120 }]);
  });

  it("no acepta donaciones si la campaña está cerrada", async () => {
    await prisma.project.update({ where: { id: projectId }, data: { acceptsDonations: false } });
    await expect(createDonation(donorId, { amount: 50, method: "QR", projectId })).rejects.toThrow(/ya no recibe/);
    await prisma.project.update({ where: { id: projectId }, data: { acceptsDonations: true } });
  });
});
