// Construcción de la aplicación Express del economy-service.

import cors from "cors";
import express, { type Express } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { config } from "./config/config.js";
import { errorHandler, notFoundHandler } from "./shared/errors.js";
import { logger } from "./shared/logger.js";
import { gachaRouter } from "./modules/gacha/gacha.router.js";
import { healthRouter } from "./modules/health/health.router.js";
import { internalRouter } from "./modules/internal/internal.router.js";
import { playerInventoryRouter } from "./modules/player-inventory/player-inventory.router.js";
import { rewardsRouter } from "./modules/rewards/rewards.router.js";
import { transactionsRouter } from "./modules/transactions/transactions.router.js";
import { walletRouter } from "./modules/wallet/wallet.router.js";

export function createApp(): Express {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    cors({
      origin:
        config.CORS_ORIGIN === "*"
          ? true
          : config.CORS_ORIGIN.split(",").map((origin) => origin.trim()),
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(pinoHttp({ logger }));
  app.use(
    rateLimit({
      windowMs: 60_000,
      limit: config.RATE_LIMIT_MAX,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.use("/health", healthRouter);
  app.use("/internal", internalRouter);
  app.use("/api/v1/wallet", walletRouter);
  app.use("/api/v1/transactions", transactionsRouter);
  app.use("/api/v1/gacha", gachaRouter);
  app.use("/api/v1/rewards", rewardsRouter);
  app.use("/api/v1/items", playerInventoryRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
