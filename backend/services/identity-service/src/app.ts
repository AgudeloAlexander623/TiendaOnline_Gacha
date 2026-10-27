// Construcción de la aplicación Express del identity-service.
// Middleware transversal: seguridad (helmet), CORS, JSON, logs y rate limit.

import cors from "cors";
import express, { type Express } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { config } from "./config/config.js";
import { errorHandler, notFoundHandler } from "./shared/errors.js";
import { logger } from "./shared/logger.js";
import { authRouter } from "./modules/auth/auth.router.js";
import { healthRouter } from "./modules/health/health.router.js";
import { usersRouter } from "./modules/users/users.router.js";

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
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/users", usersRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

