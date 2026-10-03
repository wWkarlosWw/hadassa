import "server-only";
import { prisma } from "@/shared/lib/prisma";
import { DomainError } from "@/shared/lib/action-result";
import type { PointsReason, Prisma } from "@/generated/prisma/client";

type Tx = Prisma.TransactionClient;

interface Movement {
  profileId: string;
  amount: number;
  reason: PointsReason;
  description: string;
  referenceId?: string | null;
  createdById?: string | null;
}

/**
 * Registra un movimiento de puntos y actualiza el saldo dentro de la misma
 * transacción. Para débitos verifica saldo de forma atómica (sin carreras).
 */
export async function recordMovement(tx: Tx, m: Movement) {
  if (m.amount === 0) return;
  if (m.amount < 0) {
    const { count } = await tx.profile.updateMany({
      where: { id: m.profileId, points: { gte: -m.amount } },
      data: { points: { increment: m.amount } },
    });
    if (count === 0) throw new DomainError("No tienes puntos suficientes.");
  } else {
    await tx.profile.update({ where: { id: m.profileId }, data: { points: { increment: m.amount } } });
  }
  await tx.pointsTransaction.create({
    data: {
      profileId: m.profileId,
      amount: m.amount,
      reason: m.reason,
      description: m.description,
      referenceId: m.referenceId ?? null,
      createdById: m.createdById ?? null,
    },
  });
}

export async function getHistory(profileId: string, take = 50) {
  return prisma.pointsTransaction.findMany({
    where: { profileId },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function getTotalEarned(profileId: string) {
  const agg = await prisma.pointsTransaction.aggregate({
    where: { profileId, amount: { gt: 0 }, reason: { in: ["DONATION", "ATTENDANCE", "ADJUSTMENT"] } },
    _sum: { amount: true },
  });
  return agg._sum.amount ?? 0;
}

/** Ajuste manual hecho por un admin (positivo o negativo). */
export async function adjustPoints(profileId: string, amount: number, description: string, adminId: string) {
  if (!Number.isInteger(amount) || amount === 0) throw new DomainError("Ingresa una cantidad válida.");
  await prisma.$transaction((tx) =>
    recordMovement(tx, { profileId, amount, reason: "ADJUSTMENT", description, createdById: adminId }),
  );
}
