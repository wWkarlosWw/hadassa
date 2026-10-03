import "server-only";
import { prisma } from "@/shared/lib/prisma";
import { DomainError } from "@/shared/lib/action-result";
import { recordMovement } from "@/modules/points/service";
import type { AllyInput, RewardInput } from "./schemas";

// ─── Aliados ────────────────────────────────────────────────────────────────

export const listAllies = () =>
  prisma.ally.findMany({ include: { _count: { select: { rewards: true } } }, orderBy: { name: "asc" } });

export async function saveAlly(input: AllyInput) {
  const { id, ...data } = input;
  const payload = { ...data, logoUrl: data.logoUrl || null };
  return id ? prisma.ally.update({ where: { id }, data: payload }) : prisma.ally.create({ data: payload });
}

export const deleteAlly = (id: string) => prisma.ally.delete({ where: { id } });

// ─── Recompensas ────────────────────────────────────────────────────────────

/** Recompensas disponibles para canjear (activas, vigentes y con stock). */
export async function listAvailableRewards() {
  const now = new Date();
  const rewards = await prisma.reward.findMany({
    where: {
      isActive: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      AND: [{ OR: [{ stock: null }, { stock: { gt: 0 } }] }],
    },
    include: { ally: { select: { name: true, logoUrl: true } } },
    orderBy: { pointsCost: "asc" },
  });
  return rewards;
}

export const listAllRewards = () =>
  prisma.reward.findMany({
    include: { ally: { select: { id: true, name: true } }, _count: { select: { claims: true } } },
    orderBy: { createdAt: "desc" },
  });

export async function saveReward(input: RewardInput) {
  const { id, ...data } = input;
  const payload = { ...data, allyId: data.allyId ?? null, imageUrl: data.imageUrl || null };
  return id ? prisma.reward.update({ where: { id }, data: payload }) : prisma.reward.create({ data: payload });
}

export async function deleteReward(id: string) {
  const claims = await prisma.rewardClaim.count({ where: { rewardId: id } });
  if (claims > 0) {
    await prisma.reward.update({ where: { id }, data: { isActive: false } });
    return "deactivated" as const;
  }
  await prisma.reward.delete({ where: { id } });
  return "deleted" as const;
}

// ─── Canjes ─────────────────────────────────────────────────────────────────

/** Canjea una recompensa: descuenta puntos y stock de forma atómica. */
export async function claimReward(profileId: string, rewardId: string) {
  return prisma.$transaction(async (tx) => {
    const reward = await tx.reward.findUnique({ where: { id: rewardId } });
    if (!reward || !reward.isActive) throw new DomainError("Esta recompensa no está disponible.");
    if (reward.expiresAt && reward.expiresAt <= new Date()) throw new DomainError("Esta recompensa ya expiró.");

    if (reward.stock !== null) {
      const { count } = await tx.reward.updateMany({
        where: { id: rewardId, stock: { gt: 0 } },
        data: { stock: { decrement: 1 } },
      });
      if (count === 0) throw new DomainError("Esta recompensa está agotada.");
    }

    const claim = await tx.rewardClaim.create({
      data: { profileId, rewardId, pointsSpent: reward.pointsCost },
    });

    await recordMovement(tx, {
      profileId,
      amount: -reward.pointsCost,
      reason: "REDEMPTION",
      description: `Canje: ${reward.title}`,
      referenceId: claim.id,
    });

    return { claim, code: reward.code };
  });
}

export const listMyClaims = (profileId: string) =>
  prisma.rewardClaim.findMany({
    where: { profileId },
    include: { reward: { select: { title: true, code: true, discountPercent: true, ally: { select: { name: true } } } } },
    orderBy: { createdAt: "desc" },
  });

export const listAllClaims = () =>
  prisma.rewardClaim.findMany({
    include: {
      profile: { select: { fullName: true, email: true } },
      reward: { select: { title: true, code: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

/** Marca un canje como entregado/usado. */
export async function redeemClaim(claimId: string, handlerId: string) {
  const { count } = await prisma.rewardClaim.updateMany({
    where: { id: claimId, status: "PENDING" },
    data: { status: "REDEEMED", handledById: handlerId, handledAt: new Date() },
  });
  if (count === 0) throw new DomainError("El canje ya fue procesado.");
}

/** Cancela un canje pendiente y devuelve puntos y stock. */
export async function cancelClaim(claimId: string, handlerId: string) {
  await prisma.$transaction(async (tx) => {
    const claim = await tx.rewardClaim.findUnique({ where: { id: claimId }, include: { reward: true } });
    if (!claim) throw new DomainError("Canje no encontrado.");
    const { count } = await tx.rewardClaim.updateMany({
      where: { id: claimId, status: "PENDING" },
      data: { status: "CANCELLED", handledById: handlerId, handledAt: new Date() },
    });
    if (count === 0) throw new DomainError("El canje ya fue procesado.");
    if (claim.reward.stock !== null) {
      await tx.reward.update({ where: { id: claim.rewardId }, data: { stock: { increment: 1 } } });
    }
    await recordMovement(tx, {
      profileId: claim.profileId,
      amount: claim.pointsSpent,
      reason: "REFUND",
      description: `Devolución: ${claim.reward.title}`,
      referenceId: claim.id,
      createdById: handlerId,
    });
  });
}
