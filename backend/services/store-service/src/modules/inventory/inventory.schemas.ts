// Validación del módulo de inventario.

import { z } from "zod";

export const inventoryProductParamSchema = z.object({ productId: z.uuid() });

export const adjustStockSchema = z.object({
  type: z.enum(["IN", "OUT", "ADJUSTMENT"]),
  quantity: z.coerce.number().int().min(0),
  reason: z.string().trim().max(300).optional(),
});

export type AdjustStockInput = z.infer<typeof adjustStockSchema>;
