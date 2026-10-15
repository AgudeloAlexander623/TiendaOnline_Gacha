// Rutas del módulo de recargas.

import { Router } from "express";
import { asyncHandler } from "../../shared/errors.js";
import { authenticate, requireUser } from "../../shared/auth.js";
import {
  createRechargeSchema,
  listRechargesQuerySchema,
} from "./recharges.schemas.js";
import { createRecharge, listMyRecharges } from "./recharges.service.js";

export const rechargesRouter = Router();

rechargesRouter.use(authenticate);

rechargesRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = createRechargeSchema.parse(req.body);
    res.status(201).json(await createRecharge(requireUser(req).id, input));
  }),
);

rechargesRouter.get(
  "/me",
  asyncHandler(async (req, res) => {
    const query = listRechargesQuerySchema.parse(req.query);
    res.json(await listMyRecharges(requireUser(req).id, query));
  }),
);
