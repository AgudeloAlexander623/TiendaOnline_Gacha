// Validación del módulo de carrito.

import { z } from "zod";

export const addCartItemSchema = z.object({
  productId: z.uuid(),
  quantity: z.coerce.number().int().positive().max(99).default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().positive().max(99),
});

export const cartItemParamSchema = z.object({ itemId: z.uuid() });

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
