// Rutas del módulo de gacha.

import { Router } from "express";
import { asyncHandler } from "../../shared/errors.js";
import { authenticate, requireUser } from "../../shared/auth.js";
import { gachaBannerParamSchema } from "./gacha.schemas.js";
import { listBanners, pull } from "./gacha.service.js";

export const gachaRouter = Router();

gachaRouter.get(
  "/banners",
  asyncHandler(async (_req, res) => {
    res.json({ data: await listBanners() });
  }),
);

gachaRouter.post(
  "/banners/:bannerId/pull",
  authenticate,
  asyncHandler(async (req, res) => {
    const { bannerId } = gachaBannerParamSchema.parse(req.params);
    const user = requireUser(req);
    res.status(201).json(await pull(user.id, bannerId));
  }),
);
