// Validación del módulo de niveles de descuento.

import { z } from "zod";

export const createDiscountLevelSchema = z.object({
  level: z.coerce.number().int().positive(),
  percentage: z.coerce.number().int().min(1).max(100),
  coinsRequired: z.coerce.number().int().min(0),
  description: z.string().trim().max(300).optional(),
});

export const updateDiscountLevelSchema = createDiscountLevelSchema.partial();

export const discountLevelIdParamSchema = z.object({ id: z.uuid() });

export type CreateDiscountLevelInput = z.infer<
  typeof createDiscountLevelSchema
>;
export type UpdateDiscountLevelInput = z.infer<
  typeof updateDiscountLevelSchema
>;
