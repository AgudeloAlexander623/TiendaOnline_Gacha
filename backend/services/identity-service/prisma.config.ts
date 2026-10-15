// ============================================================
// identity-service · configuración de Prisma (Prisma 7)
// ============================================================
// En Prisma 7 la URL de conexión ya NO vive en schema.prisma:
// se define aquí para comandos de migración/introspección.
// El runtime del servicio usa un driver adapter (@prisma/adapter-pg).

import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
