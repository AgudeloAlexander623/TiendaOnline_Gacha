// Datos iniciales del payments-service (idempotente).
// Crea los paquetes de monedas ofrecidos en las recargas simuladas.
// Uso: `npm run seed -w @gearquest/payments-service`.

import { prisma } from "../src/db/prisma.js";
import { logger } from "../src/shared/logger.js";

const PACKAGES = [
  { slug: "monedas-100", name: "Paquete Inicial", coins: 100, price: 9000 },
  { slug: "monedas-500", name: "Paquete Intermedio", coins: 500, price: 40000 },
  { slug: "monedas-1500", name: "Paquete Grande", coins: 1500, price: 110000 },
  { slug: "monedas-5000", name: "Paquete Premium", coins: 5000, price: 320000 },
];

async function main(): Promise<void> {
  for (const coinPackage of PACKAGES) {
    await prisma.coinPackage.upsert({
      where: { slug: coinPackage.slug },
      update: {},
      create: { ...coinPackage, currency: "COP" },
    });
    logger.info(`Paquete asegurado: ${coinPackage.name}`);
  }
}

main()
  .then(() => logger.info("Seed de payments-service completado"))
  .catch((error: unknown) => {
    logger.error({ err: error }, "Error durante el seed de payments-service");
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
