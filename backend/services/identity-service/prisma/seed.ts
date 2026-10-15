// Datos iniciales del identity-service (idempotente).
// Crea una cuenta ADMIN y una cuenta PLAYER de demostración.
// Uso: `npm run seed -w @gearquest/identity-service`.

import { prisma } from "../src/db/prisma.js";
import { hashPassword } from "../src/shared/password.js";
import { logger } from "../src/shared/logger.js";

const DEMO_USERS = [
  {
    email: "admin@gearquest.dev",
    password: "Admin1234!",
    displayName: "Administrador GearQuest",
    role: "ADMIN" as const,
  },
  {
    email: "player@gearquest.dev",
    password: "Player1234!",
    displayName: "Jugador Demo",
    role: "PLAYER" as const,
  },
];

async function main(): Promise<void> {
  for (const demo of DEMO_USERS) {
    const passwordHash = await hashPassword(demo.password);
    await prisma.user.upsert({
      where: { email: demo.email },
      update: {},
      create: {
        email: demo.email,
        passwordHash,
        displayName: demo.displayName,
        role: demo.role,
        emailVerified: true,
      },
    });
    logger.info(`Usuario asegurado: ${demo.email} (${demo.role})`);
  }
}

main()
  .then(() => logger.info("Seed de identity-service completado"))
  .catch((error: unknown) => {
    logger.error({ err: error }, "Error durante el seed de identity-service");
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
