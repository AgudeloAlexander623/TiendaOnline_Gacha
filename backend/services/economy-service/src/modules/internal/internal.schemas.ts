// Esquemas para endpoints internos.

import { z } from "zod";

export const debitInternalSchema = z.object({
  amount: z.number().int().positive(),
  reason: z.string().min(1).optional(),
  referenceType: z.string().min(1).optional(),
  referenceId: z.string().min(1).optional(),
  idempotencyKey: z.string().min(1).optional(),
  coinType: z.enum(["EARNED", "PURCHASED"]).optional(),
});

export const creditInternalSchema = z.object({
  amount: z.number().int().positive(),
  coinType: z.enum(["EARNED", "PURCHASED"]),
  source: z.string().min(1).optional(),
  reason: z.string().min(1).optional(),
  referenceType: z.string().min(1).optional(),
  referenceId: z.string().min(1).optional(),
  idempotencyKey: z.string().min(1).optional(),
});

export const validateGameSessionSchema = z.object({
  userId: z.string().uuid(),
  gameType: z.enum(["GACHA", "MINIGAME"]),
  outcome: z.enum(["STARTED", "FINISHED", "ABANDONED", "REJECTED"]),
  mapId: z.string().optional(),
  enemiesDefeated: z.number().int().optional(),
  bossesDefeated: z.number().int().optional(),
  score: z.number().int().optional(),
  itemsObtained: z.array(z.object({ itemId: z.string(), quantity: z.number().int().positive() })).optional(),
  chestSaved: z.boolean().optional(),
  idempotencyKey: z.string().min(1).optional(),
});

export const merchantRedemptionSchema = z.object({
  userId: z.string().uuid(),
  itemId: z.string().min(1),
  quantity: z.number().int().positive(),
  expectedPrice: z.number().int().nonnegative(),
  referenceType: z.string().min(1).optional(),
  referenceId: z.string().min(1).optional(),
  idempotencyKey: z.string().min(1).optional(),
});

export type DebitInternalInput = z.infer<typeof debitInternalSchema>;
export type CreditInternalInput = z.infer<typeof creditInternalSchema>;
export type ValidateGameSessionInput = z.infer<typeof validateGameSessionSchema>;
export type MerchantRedemptionInput = z.infer<typeof merchantRedemptionSchema>;
