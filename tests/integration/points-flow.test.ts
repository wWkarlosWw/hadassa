/**
 * Pruebas de integración de las reglas de negocio contra la base local
 * (requiere `npm run db:start` y migraciones aplicadas).
 */
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/shared/lib/prisma";
import { approveDonation, createDonation, rejectDonation } from "@/modules/donations/service";
import { cancelClaim, claimReward } from "@/modules/rewards/service";
import { markAttendance, registerToEvent } from "@/modules/events/service";
import { getSection } from "@/modules/cms/service";

const tag = `test-${Date.now()}`;
const donorId = randomUUID();
const adminId = randomUUID();
const supervisorId = randomUUID();
let rewardId: string;
let limitedRewardId: string;
let eventId: string;

const balance = async (id = donorId) => (await prisma.profile.findUniqueOrThrow({ where: { id } })).points;
const ledgerSum = async (id = donorId) =>
  (await prisma.pointsTransaction.aggregate({ where: { profileId: id }, _sum: { amount: true } }))._sum.amount ?? 0;

beforeAll(async () => {
  await prisma.profile.createMany({
    data: [
      { id: donorId, email: `${tag}-donor@test.local`, fullName: "Donante Test" },
      { id: adminId, email: `${tag}-admin@test.local`, fullName: "Admin Test", role: "ADMIN" },
      { id: supervisorId, email: `${tag}-sup@test.local`, fullName: "Supervisor Test", role: "SUPERVISOR" },
    ],
  });
  rewardId = (await prisma.reward.create({ data: { title: `${tag} premio`, code: "T1", pointsCost: 300 } })).id;
  limitedRewardId = (
    await prisma.reward.create({ data: { title: `${tag} limitado`, code: "T2", pointsCost: 10, stock: 1 } })
  ).id;
  eventId = (
    await prisma.event.create({
      data: { title: `${tag} evento`, startsAt: new Date(Date.now() + 86_400_000), pointsReward: 50, capacity: 1 },
    })
  ).id;
});

afterAll(async () => {
  const ids = [donorId, adminId, supervisorId];
  await prisma.donation.deleteMany({ where: { profileId: { in: ids } } });
  await prisma.reward.deleteMany({ where: { id: { in: [rewardId, limitedRewardId] } } });
  await prisma.event.deleteMany({ where: { id: eventId } });
  await prisma.profile.deleteMany({ where: { id: { in: ids } } });
  await prisma.$disconnect();
});

describe("donaciones", () => {
  it("al aprobar acredita puntos una sola vez y deja rastro en el libro", async () => {
    const { pointsPerBoliviano } = await getSection("gamification");
    const d = await createDonation(donorId, { amount: 50, method: "QR" });
    expect(d.status).toBe("PENDING");

    const points = await approveDonation(d.id, adminId);
    expect(points).toBe(50 * pointsPerBoliviano);
    expect(await balance()).toBe(points);
    expect(await ledgerSum()).toBe(points);

    await expect(approveDonation(d.id, adminId)).rejects.toThrow(/ya fue procesada/);
    expect(await balance()).toBe(points);
  });

  it("aprobaciones concurrentes no duplican puntos", async () => {
    const before = await balance();
    const d = await createDonation(donorId, { amount: 20, method: "TRANSFER" });
    const results = await Promise.allSettled([approveDonation(d.id, adminId), approveDonation(d.id, adminId)]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(await balance()).toBe(before + (results.find((r) => r.status === "fulfilled") as PromiseFulfilledResult<number>).value);
  });

  it("una donación rechazada no otorga puntos", async () => {
    const before = await balance();
    const d = await createDonation(donorId, { amount: 30, method: "QR" });
    await rejectDonation(d.id, adminId, "Comprobante ilegible");
    expect(await balance()).toBe(before);
    await expect(approveDonation(d.id, adminId)).rejects.toThrow();
  });

  it("rechaza montos bajo el mínimo configurado", async () => {
    await expect(createDonation(donorId, { amount: 1, method: "QR" })).rejects.toThrow(/mínima/);
  });
});

describe("recompensas", () => {
  it("canjear descuenta puntos y cancelar los devuelve", async () => {
    const before = await balance();
    const { claim } = await claimReward(donorId, rewardId);
    expect(await balance()).toBe(before - 300);
    await cancelClaim(claim.id, adminId);
    expect(await balance()).toBe(before);
    expect(await ledgerSum()).toBe(await balance());
  });

  it("canjes concurrentes nunca dejan saldo negativo", async () => {
    await prisma.profile.update({ where: { id: donorId }, data: { points: 0 } });
    await prisma.pointsTransaction.deleteMany({ where: { profileId: donorId } });
    await prisma.$transaction([
      prisma.profile.update({ where: { id: donorId }, data: { points: 400 } }),
      prisma.pointsTransaction.create({ data: { profileId: donorId, amount: 400, reason: "ADJUSTMENT" } }),
    ]);

    const results = await Promise.allSettled([claimReward(donorId, rewardId), claimReward(donorId, rewardId)]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(await balance()).toBe(100);
    expect(await ledgerSum()).toBe(100);
  });

  it("respeta el stock disponible", async () => {
    await claimReward(donorId, limitedRewardId);
    await expect(claimReward(donorId, limitedRewardId)).rejects.toThrow(/agotada/);
  });
});

describe("actividades", () => {
  it("solo el supervisor asignado (o admin) valida asistencia, y otorga puntos una vez", async () => {
    const p = await registerToEvent(donorId, eventId);
    await expect(registerToEvent(adminId, eventId)).rejects.toThrow(/cupos/);

    await expect(markAttendance(p.id, { id: supervisorId, role: "SUPERVISOR" })).rejects.toThrow(/asignado/);

    await prisma.eventSupervisor.create({ data: { profileId: supervisorId, eventId } });
    const before = await balance();
    await markAttendance(p.id, { id: supervisorId, role: "SUPERVISOR" });
    expect(await balance()).toBe(before + 50);
    await expect(markAttendance(p.id, { id: adminId, role: "ADMIN" })).rejects.toThrow(/ya fue registrada/);
  });
});
