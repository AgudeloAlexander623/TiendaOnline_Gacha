// Rutas de la billetera (requieren autenticación).

import { Router } from "express";
import { asyncHandler } from "../../shared/errors.js";
import { authenticate, requireUser } from "../../shared/auth.js";
import { getBalance, listBatches } from "./wallet.service.js";

export const walletRouter = Router();

walletRouter.use(authenticate);

walletRouter.get(
  "/me",
  asyncHandler(async (req, res) => {
    res.json(await getBalance(requireUser(req).id));
  }),
);

walletRouter.get(
  "/me/batches",
  asyncHandler(async (req, res) => {
    res.json({ data: await listBatches(requireUser(req).id) });
  }),
);
