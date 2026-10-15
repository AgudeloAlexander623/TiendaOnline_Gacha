// Rutas del módulo de recompensas por minijuegos.

import { Router } from "express";
import { asyncHandler } from "../../shared/errors.js";
import { authenticate, requireUser } from "../../shared/auth.js";
import {
  finishSessionSchema,
  sessionIdParamSchema,
  startSessionSchema,
} from "./rewards.schemas.js";
import {
  finishSession,
  listMySessions,
  startSession,
} from "./rewards.service.js";

export const rewardsRouter = Router();

rewardsRouter.use(authenticate);

rewardsRouter.get(
  "/sessions/me",
  asyncHandler(async (req, res) => {
    res.json({ data: await listMySessions(requireUser(req).id) });
  }),
);

rewardsRouter.post(
  "/sessions",
  asyncHandler(async (req, res) => {
    const input = startSessionSchema.parse(req.body ?? {});
    res.status(201).json(await startSession(requireUser(req).id, input));
  }),
);

rewardsRouter.post(
  "/sessions/:sessionId/finish",
  asyncHandler(async (req, res) => {
    const { sessionId } = sessionIdParamSchema.parse(req.params);
    const input = finishSessionSchema.parse(req.body);
    res.json(await finishSession(requireUser(req).id, sessionId, input));
  }),
);
