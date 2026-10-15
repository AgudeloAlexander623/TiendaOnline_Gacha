// Rutas del módulo de inventario (lectura pública, escritura solo ADMIN).

import { Router } from "express";
import { asyncHandler } from "../../shared/errors.js";
import { authenticate, requireRole } from "../../shared/auth.js";
import {
  adjustStockSchema,
  inventoryProductParamSchema,
} from "./inventory.schemas.js";
import { adjustStock, getInventory } from "./inventory.service.js";

export const inventoryRouter = Router();

inventoryRouter.get(
  "/:productId",
  asyncHandler(async (req, res) => {
    const { productId } = inventoryProductParamSchema.parse(req.params);
    res.json(await getInventory(productId));
  }),
);

inventoryRouter.patch(
  "/:productId",
  authenticate,
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const { productId } = inventoryProductParamSchema.parse(req.params);
    const input = adjustStockSchema.parse(req.body);
    res.json(await adjustStock(productId, input));
  }),
);
