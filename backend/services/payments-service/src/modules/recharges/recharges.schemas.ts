// Validación del módulo de recargas.

import { z } from "zod";

export const createRechargeSchema = z.object({
  packageId: z.uuid(),
});

export const listRechargesQuerySchema = z.object({
  status: z.enum(["PENDING", "COMPLETED", "FAILED", "REFUNDED"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateRechargeInput = z.infer<typeof createRechargeSchema>;
export type ListRechargesQuery = z.infer<typeof listRechargesQuerySchema>;
