// Rutas del inventario de objetos del jugador.

import { Router } from "express";
import { asyncHandler } from "../../shared/errors.js";
import { authenticate, requireUser } from "../../shared/auth.js";
import { listPlayerItems } from "./player-inventory.service.js";

export const playerInventoryRouter = Router();

playerInventoryRouter.use(authenticate);

playerInventoryRouter.get(
  "/me",
  asyncHandler(async (req, res) => {
    res.json({ data: await listPlayerItems(requireUser(req).id) });
  }),
);
