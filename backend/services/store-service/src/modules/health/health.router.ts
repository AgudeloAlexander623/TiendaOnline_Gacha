// Endpoints de salud del store-service.

import { Router } from "express";
import { config } from "../../config/config.js";
import { prisma } from "../../db/prisma.js";
import { asyncHandler } from "../../shared/errors.js";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.json({
    service: config.SERVICE_NAME,
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

healthRouter.get(
  "/ready",
  asyncHandler(async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ service: config.SERVICE_NAME, status: "ready" });
    } catch {
      res.status(503).json({ service: config.SERVICE_NAME, status: "not_ready" });
    }
  }),
);
