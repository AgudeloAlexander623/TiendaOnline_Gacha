// Rutas del módulo de pedidos.

import { Router } from "express";
import { asyncHandler } from "../../shared/errors.js";
import { authenticate, requireRole, requireUser } from "../../shared/auth.js";
import {
  checkoutSchema,
  listOrdersQuerySchema,
  orderIdParamSchema,
  updateOrderStatusSchema,
} from "./orders.schemas.js";
import {
  checkout,
  getOrder,
  listAllOrders,
  listMyOrders,
  updateOrderStatus,
} from "./orders.service.js";

export const ordersRouter = Router();

ordersRouter.use(authenticate);

ordersRouter.post(
  "/checkout",
  asyncHandler(async (req, res) => {
    const input = checkoutSchema.parse(req.body ?? {});
    res.status(201).json(await checkout(requireUser(req).id, input));
  }),
);

ordersRouter.get(
  "/me",
  asyncHandler(async (req, res) => {
    const query = listOrdersQuerySchema.parse(req.query);
    res.json(await listMyOrders(requireUser(req).id, query));
  }),
);

ordersRouter.get(
  "/",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const query = listOrdersQuerySchema.parse(req.query);
    res.json(await listAllOrders(query));
  }),
);

ordersRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = orderIdParamSchema.parse(req.params);
    const user = requireUser(req);
    res.json(await getOrder(id, { id: user.id, role: user.role }));
  }),
);

ordersRouter.patch(
  "/:id/status",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const { id } = orderIdParamSchema.parse(req.params);
    const input = updateOrderStatusSchema.parse(req.body);
    res.json(await updateOrderStatus(id, input));
  }),
);
