// Consulta del libro mayor de monedas.

import { z } from "zod";
import { prisma } from "../../db/prisma.js";
import { getOrCreateWallet } from "../wallet/wallet.service.js";

export const listTransactionsQuerySchema = z.object({
  type: z.enum(["CREDIT", "DEBIT", "EXPIRE", "ADJUSTMENT"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type ListTransactionsQuery = z.infer<
  typeof listTransactionsQuerySchema
>;

export async function listTransactions(
  userId: string,
  query: ListTransactionsQuery,
) {
  const wallet = await getOrCreateWallet(userId);
  const { page, pageSize, type } = query;
  const where = { walletId: wallet.id, ...(type ? { type } : {}) };

  const [total, transactions] = await Promise.all([
    prisma.coinTransaction.count({ where }),
    prisma.coinTransaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    data: transactions,
    meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  };
}
