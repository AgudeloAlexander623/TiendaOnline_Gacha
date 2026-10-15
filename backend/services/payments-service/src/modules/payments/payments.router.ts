// Rutas del módulo de pagos.

import { Router } from "express";
import { asyncHandler } from "../../shared/errors.js";
import { authenticate, requireRole, requireUser } from "../../shared/auth.js";
import {
  createPaymentSchema,
  listPaymentsQuerySchema,
  paymentIdParamSchema,
  refundSchema,
} from "./payments.schemas.js";
import {
  confirmPayment,
  createPayment,
  getPayment,
  listMyPayments,
  refundPayment,
} from "./payments.service.js";

export const paymentsRouter = Router();

paymentsRouter.use(authenticate);

paymentsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = createPaymentSchema.parse(req.body);
    res.status(201).json(await createPayment(requireUser(req).id, input));
  }),
);

paymentsRouter.get(
  "/me",
  asyncHandler(async (req, res) => {
    const query = listPaymentsQuerySchema.parse(req.query);
    res.json(await listMyPayments(requireUser(req).id, query));
  }),
);

paymentsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = paymentIdParamSchema.parse(req.params);
    const user = requireUser(req);
    res.json(await getPayment(id, { id: user.id, role: user.role }));
  }),
);

paymentsRouter.post(
  "/:id/confirm",
  asyncHandler(async (req, res) => {
    const { id } = paymentIdParamSchema.parse(req.params);
    const user = requireUser(req);
    res.json(await confirmPayment(id, { id: user.id, role: user.role }));
  }),
);

paymentsRouter.post(
  "/:id/refund",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const { id } = paymentIdParamSchema.parse(req.params);
    const input = refundSchema.parse(req.body ?? {});
    res.json(await refundPayment(id, input));
  }),
);
