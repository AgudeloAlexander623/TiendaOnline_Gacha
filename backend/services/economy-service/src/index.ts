// Punto de entrada del economy-service.

import { createApp } from "./app.js";
import { config } from "./config/config.js";
import { prisma } from "./db/prisma.js";
import { logger } from "./shared/logger.js";

const app = createApp();

const server = app.listen(config.PORT, () => {
  logger.info(`${config.SERVICE_NAME} escuchando en el puerto ${config.PORT}`);
});

async function shutdown(signal: string): Promise<void> {
  logger.info(`Señal ${signal} recibida; cerrando el servicio...`);
  server.close(() => {
    void prisma.$disconnect().finally(() => process.exit(0));
  });
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
