// Cliente Prisma (Prisma 7) con driver adapter de PostgreSQL.
// Se reutiliza una única instancia para evitar agotar el pool de conexiones.

import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "../config/config.js";
import { PrismaClient } from "../generated/prisma/client.js";

const adapter = new PrismaPg({ connectionString: config.DATABASE_URL });

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (config.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
