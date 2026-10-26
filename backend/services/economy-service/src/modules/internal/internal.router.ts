// Rutas internas para comunicación entre servicios.

import { Router } from "express";
import { asyncHandler } from "../../shared/errors.js";
import { authenticateService } from "../../shared/auth.js";
import { withIdempotency } from "../../shared/idempotency.js";
import { validateBody } from "../../shared/middlewares/validate.js";
import { creditInternalSchema, debitInternalSchema, validateGameSessionSchema } from "./internal.schemas.js";
import { creditInternal, debitInternal, getInternalBalance } from "./internal.service.js";
import { validateGameSessionInternal } from "./gameSessions.service.js";

export const internalRouter = Router();

internalRouter.get(
  "/wallets/:userId/balance",
  authenticateService(["wallet:read"]),
  asyncHandler(async (req, res) => {
    res.json(await getInternalBalance(req.params.userId));
  }),
);

internalRouter.post(
  "/wallets/:userId/debit",
  authenticateService(["wallet:debit"]),
  withIdempotency({ required: false, service: "economy-service" }),
  validateBody(debitInternalSchema),
  asyncHandler(async (req, res) => {
    const input = debitInternalSchema.parse(req.body);
    res.json(await debitInternal(req.params.userId, input));
  }),
);

internalRouter.post(
  "/wallets/:userId/credit",
  authenticateService(["wallet:credit"]),
  withIdempotency({ required: false, service: "economy-service" }),
  validateBody(creditInternalSchema),
  asyncHandler(async (req, res) => {
    const input = creditInternalSchema.parse(req.body);
    res.json(await creditInternal(req.params.userId, input));
  }),
);

internalRouter.post(
  "/game-sessions/:sessionId/validate",
  authenticateService(["game:validate"]),
  withIdempotency({ required: false, service: "economy-service" }),
  validateBody(validateGameSessionSchema),
  asyncHandler(async (req, res) => {
    const input = validateGameSessionSchema.parse(req.body);
    res.json(await validateGameSessionInternal(req.params.sessionId, input));
  }),
);
