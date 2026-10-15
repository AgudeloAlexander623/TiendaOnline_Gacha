// Rutas del historial de transacciones (requieren autenticación).

import { Router } from "express";
import { asyncHandler } from "../../shared/errors.js";
import { authenticate, requireUser } from "../../shared/auth.js";
import {
  listTransactions,
  listTransactionsQuerySchema,
} from "./transactions.service.js";

export const transactionsRouter = Router();

transactionsRouter.use(authenticate);

transactionsRouter.get(
  "/me",
  asyncHandler(async (req, res) => {
    const query = listTransactionsQuerySchema.parse(req.query);
    res.json(await listTransactions(requireUser(req).id, query));
  }),
);
