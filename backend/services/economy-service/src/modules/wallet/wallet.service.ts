// Núcleo de la economía: billetera, lotes de monedas y libro mayor.
// Reglas: servidor es fuente de verdad, EARNED caduca, PURCHASED no, FIFO por vencimiento, libro mayor append-only.

import type { CoinBatch, Wallet } from "../../generated/prisma/client.js";
import type { Prisma } from "../../generated/prisma/client.js";
import { config } from "../../config/config.js";
import { prisma } from "../../db/prisma.js";
import { AppError } from "../../shared/errors.js";

export type Tx = Prisma.TransactionClient;

export interface CoinOperationMeta {
  referenceType?: string | null;
  referenceId?: string | null;
  description?: string | null;
}

export interface BatchConsumed {
  batchId: string;
  type: "EARNED" | "PURCHASED";
  amount: number;
}

export async function getOrCreateWallet(
  userId: string,
  db: Tx = prisma,
): Promise<Wallet> {
  const existing = await db.wallet.findUnique({ where: { userId } });
  if (existing) {
    return existing;
  }
  return db.wallet.create({ data: { userId } });
}

async function sumActiveBatches(db: Tx, walletId: string): Promise<number> {
  const result = await db.coinBatch.aggregate({
    where: { walletId, status: "ACTIVE", remainingAmount: { gt: 0 } },
    _sum: { remainingAmount: true },
  });
  return result._sum.remainingAmount ?? 0;
}

/** Marca como EXPIRED los lotes vencidos y registra el movimiento correspondiente. */
export async function expireDueBatches(
  walletId: string,
  db: Tx = prisma,
): Promise<number> {
  const now = new Date();
  const expired = await db.coinBatch.findMany({
    where: {
      walletId,
      status: "ACTIVE",
      remainingAmount: { gt: 0 },
      expiresAt: { not: null, lte: now },
    },
  });

  for (const batch of expired) {
    await db.coinBatch.update({
      where: { id: batch.id },
      data: { remainingAmount: 0, status: "EXPIRED" },
    });
    const balanceAfter = await sumActiveBatches(db, walletId);
    await db.coinTransaction.create({
      data: {
        walletId,
        type: "EXPIRE",
        coinType: batch.type,
        amount: -batch.remainingAmount,
        balanceAfter,
        referenceType: "coin_batch",
        referenceId: batch.id,
        description: "Vencimiento de monedas ganadas",
      },
    });
  }

  return expired.length;
}

export async function getBalance(userId: string): Promise<{
  walletId: string;
  balance: number;
}> {
  const wallet = await getOrCreateWallet(userId);
  await expireDueBatches(wallet.id);
  const balance = await sumActiveBatches(prisma, wallet.id);
  return { walletId: wallet.id, balance };
}

export async function listBatches(userId: string): Promise<CoinBatch[]> {
  const wallet = await getOrCreateWallet(userId);
  await expireDueBatches(wallet.id);
  return prisma.coinBatch.findMany({
    where: { walletId: wallet.id },
    orderBy: [{ status: "asc" }, { expiresAt: "asc" }],
  });
}

/** Acredita monedas creando un lote y su movimiento CREDIT. */
export async function creditCoins(
  walletId: string,
  input: {
    type: "EARNED" | "PURCHASED";
    amount: number;
    source: string;
    expiresAt?: Date | null;
  } & CoinOperationMeta,
  db: Tx = prisma,
): Promise<{ balanceAfter: number; batchId: string }> {
  if (input.amount <= 0) {
    throw new AppError("El monto a acreditar debe ser positivo", {
      code: "INVALID_AMOUNT",
      statusCode: 400,
    });
  }

  const expiresAt =
    input.type === "EARNED"
      ? (input.expiresAt ??
        new Date(
          Date.now() + config.EARNED_COINS_TTL_DAYS * 24 * 60 * 60 * 1000,
        ))
      : (input.expiresAt ?? null);

  const batch = await db.coinBatch.create({
    data: {
      walletId,
      type: input.type,
      source: input.source,
      originalAmount: input.amount,
      remainingAmount: input.amount,
      expiresAt,
    },
  });

  const balanceAfter = await sumActiveBatches(db, walletId);
  await db.coinTransaction.create({
    data: {
      walletId,
      type: "CREDIT",
      coinType: input.type,
      amount: input.amount,
      balanceAfter,
      referenceType: input.referenceType ?? null,
      referenceId: input.referenceId ?? null,
      description: input.description ?? null,
    },
  });

  return { balanceAfter, batchId: batch.id };
}

/** Debita monedas consumiendo lotes por vencimiento más próximo (FIFO). */
export async function debitCoins(
  walletId: string,
  input: {
    amount: number;
    coinType?: "EARNED" | "PURCHASED";
  } & CoinOperationMeta,
  db: Tx = prisma,
): Promise<{ balanceAfter: number; batchesConsumed: BatchConsumed[]; transactionId: string }> {
  if (input.amount <= 0) {
    throw new AppError("El monto a debitar debe ser positivo", {
      code: "INVALID_AMOUNT",
      statusCode: 400,
    });
  }

  await expireDueBatches(walletId, db);

  const batches = await db.coinBatch.findMany({
    where: { walletId, status: "ACTIVE", remainingAmount: { gt: 0 } },
    orderBy: [{ expiresAt: { sort: "asc", nulls: "last" } }, { createdAt: "asc" }],
  });

  const available = batches.reduce((acc, b) => acc + b.remainingAmount, 0);
  if (available < input.amount) {
    throw new AppError("Monedas insuficientes", {
      code: "INSUFFICIENT_COINS",
      statusCode: 409,
    });
  }

  let pending = input.amount;
  let firstConsumedType: "EARNED" | "PURCHASED" | undefined;
  const batchesConsumed: BatchConsumed[] = [];

  for (const batch of batches) {
    if (pending === 0) {
      break;
    }
    const take = Math.min(batch.remainingAmount, pending);
    const newRemaining = batch.remainingAmount - take;
    await db.coinBatch.update({
      where: { id: batch.id },
      data: {
        remainingAmount: newRemaining,
        status: newRemaining === 0 ? "DEPLETED" : "ACTIVE",
      },
    });
    batchesConsumed.push({ batchId: batch.id, type: batch.type, amount: take });
    firstConsumedType ??= batch.type;
    pending -= take;
  }

  const balanceAfter = await sumActiveBatches(db, walletId);
  const tx = await db.coinTransaction.create({
    data: {
      walletId,
      type: "DEBIT",
      coinType: firstConsumedType ?? input.coinType ?? "EARNED",
      amount: -input.amount,
      balanceAfter,
      referenceType: input.referenceType ?? null,
      referenceId: input.referenceId ?? null,
      description: input.description ?? null,
    },
  });

  return { balanceAfter, batchesConsumed, transactionId: tx.id };
}
