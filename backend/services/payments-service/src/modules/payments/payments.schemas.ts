// Validación del módulo de pagos.

import { z } from "zod";

export const createPaymentSchema = z.object({
  amount: z.coerce.number().positive(),
  currency: z.string().trim().length(3).optional(),
  orderId: z.uuid().optional(),
  provider: z.enum(["MOCK", "STRIPE", "MERCADOPAGO"]).optional(),
});

export const paymentIdParamSchema = z.object({ id: z.uuid() });

export const listPaymentsQuerySchema = z.object({
  status: z
    .enum(["PENDING", "APPROVED", "REJECTED", "REFUNDED", "CANCELLED"])
    .optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export const refundSchema = z.object({
  reason: z.string().trim().max(300).optional(),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type ListPaymentsQuery = z.infer<typeof listPaymentsQuerySchema>;
export type RefundInput = z.infer<typeof refundSchema>;
