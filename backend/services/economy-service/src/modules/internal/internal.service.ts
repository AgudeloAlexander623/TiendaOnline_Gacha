// Lógica de endpoints internos.

import { prisma } from "../../db/prisma.js";
import { AppError } from "../../shared/errors.js";
import { creditCoins, debitCoins, getOrCreateWallet } from "../wallet/wallet.service.js";
import type { CreditInternalInput, DebitInternalInput } from "./internal.schemas.js";

export async function getInternalBalance(userId: string) {
  const wallet = await getOrCreateWallet(userId);
  const { expireDueBatches } = await import("../wallet/wallet.service.js");
  await expireDueBatches(wallet.id);
  const result = await prisma.coinBatch.aggregate({
    where: { walletId: wallet.id, status: "ACTIVE", remainingAmount: { gt: 0 } },
    _sum: { remainingAmount: true },
  });
  const available = result._sum.remainingAmount ?? 0;
  const batches = await prisma.coinBatch.groupBy({
    by: ["type"],
    where: { walletId: wallet.id, status: "ACTIVE", remainingAmount: { gt: 0 } },
    _sum: { remainingAmount: true },
  });
  const byType: Record<string, number> = { EARNED: 0, PURCHASED: 0 };
  for (const b of batches) {
    byType[b.type] = b._sum.remainingAmount ?? 0;
  }
  return {
    userId,
    available,
    byType,
    asOf: new Date().toISOString(),
  };
}

export async function debitInternal(userId: string, input: DebitInternalInput) {
  const wallet = await getOrCreateWallet(userId);
  const result = await prisma.$transaction(async (tx) => {
    return debitCoins(
      wallet.id,
      {
        amount: input.amount,
        reason: input.reason ?? "internal_debit",
        referenceType: input.referenceType ?? null,
        referenceId: input.referenceId ?? null,
        description: input.reason ?? null,
      },
      tx,
    );
  });
  return {
    debited: input.amount,
    balanceAfter: result.balanceAfter,
    batchesConsumed: result.batchesConsumed,
    transactionId: result.transactionId,
  };
}

export async function creditInternal(userId: string, input: CreditInternalInput) {
  if (input.amount <= 0) {
    throw new AppError("El monto a acreditar debe ser positivo", { code: "INVALID_AMOUNT", statusCode: 400 });
  }
  const wallet = await getOrCreateWallet(userId);
  const result = await prisma.$transaction(async (tx) => {
    return creditCoins(
      wallet.id,
      {
        type: input.coinType,
        amount: input.amount,
        source: input.source ?? input.reason ?? "internal_credit",
        expiresAt: input.coinType === "PURCHASED" ? null : undefined,
        reason: input.reason ?? null,
        referenceType: input.referenceType ?? null,
        referenceId: input.referenceId ?? null,
        description: input.reason ?? null,
      },
      tx,
    );
  });
  return {
    credited: input.amount,
    balanceAfter: result.balanceAfter,
    batchId: result.batchId,
    transactionId: undefined,
  };
}
