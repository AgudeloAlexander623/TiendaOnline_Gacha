// Construcción de la aplicación Express del store-service.

import cors from "cors";
import express, { type Express } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { config } from "./config/config.js";
import { errorHandler, notFoundHandler } from "./shared/errors.js";
import { logger } from "./shared/logger.js";
import { categoriesRouter } from "./modules/catalog/categories.router.js";
import { productsRouter } from "./modules/catalog/products.router.js";
import { discountsRouter } from "./modules/discounts/discounts.router.js";
import { healthRouter } from "./modules/health/health.router.js";
import { inventoryRouter } from "./modules/inventory/inventory.router.js";
import { cartsRouter } from "./modules/orders/carts.router.js";
import { ordersRouter } from "./modules/orders/orders.router.js";

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
  app.use("/api/v1/categories", categoriesRouter);
  app.use("/api/v1/products", productsRouter);
  app.use("/api/v1/inventory", inventoryRouter);
  app.use("/api/v1/carts", cartsRouter);
  app.use("/api/v1/orders", ordersRouter);
  app.use("/api/v1/discounts", discountsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
