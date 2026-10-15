// Rutas del módulo de niveles de descuento.

import { Router } from "express";
import { asyncHandler } from "../../shared/errors.js";
import { authenticate, requireRole } from "../../shared/auth.js";
import {
  createDiscountLevelSchema,
  discountLevelIdParamSchema,
  updateDiscountLevelSchema,
} from "./discounts.schemas.js";
import {
  createDiscountLevel,
  deleteDiscountLevel,
  listDiscountLevels,
  updateDiscountLevel,
} from "./discounts.service.js";

export const discountsRouter = Router();

discountsRouter.get(
  "/levels",
  asyncHandler(async (req, res) => {
    const onlyActive = req.query.includeInactive !== "true";
    res.json({ data: await listDiscountLevels(onlyActive) });
  }),
);

discountsRouter.post(
  "/levels",
  authenticate,
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const input = createDiscountLevelSchema.parse(req.body);
    res.status(201).json(await createDiscountLevel(input));
  }),
);

discountsRouter.patch(
  "/levels/:id",
  authenticate,
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const { id } = discountLevelIdParamSchema.parse(req.params);
    const input = updateDiscountLevelSchema.parse(req.body);
    res.json(await updateDiscountLevel(id, input));
  }),
);

discountsRouter.delete(
  "/levels/:id",
  authenticate,
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const { id } = discountLevelIdParamSchema.parse(req.params);
    await deleteDiscountLevel(id);
    res.status(204).send();
  }),
);
