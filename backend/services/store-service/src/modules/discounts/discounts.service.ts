// Lógica de negocio de los niveles de descuento.
// Los niveles relacionan monedas (economy-service) con un porcentaje de descuento.
// La validación/debito de monedas al canjear está pendiente (ver orders.service).

import type { DiscountLevel } from "../../generated/prisma/client.js";
import { prisma } from "../../db/prisma.js";
import { AppError } from "../../shared/errors.js";
import type {
  CreateDiscountLevelInput,
  UpdateDiscountLevelInput,
} from "./discounts.schemas.js";

export async function listDiscountLevels(
  onlyActive: boolean,
): Promise<DiscountLevel[]> {
  return prisma.discountLevel.findMany({
    where: onlyActive ? { isActive: true } : {},
    orderBy: { level: "asc" },
  });
}

export async function createDiscountLevel(
  input: CreateDiscountLevelInput,
): Promise<DiscountLevel> {
  const existing = await prisma.discountLevel.findUnique({
    where: { level: input.level },
  });
  if (existing) {
    throw new AppError("Ya existe un nivel con ese número", {
      code: "DISCOUNT_LEVEL_TAKEN",
      statusCode: 409,
    });
  }

  return prisma.discountLevel.create({
    data: {
      level: input.level,
      percentage: input.percentage,
      coinsRequired: input.coinsRequired,
      description: input.description ?? null,
    },
  });
}

export async function updateDiscountLevel(
  id: string,
  input: UpdateDiscountLevelInput,
): Promise<DiscountLevel> {
  const level = await prisma.discountLevel.findUnique({ where: { id } });
  if (!level) {
    throw new AppError("Nivel de descuento no encontrado", {
      code: "DISCOUNT_LEVEL_NOT_FOUND",
      statusCode: 404,
    });
  }

  return prisma.discountLevel.update({
    where: { id },
    data: {
      level: input.level,
      percentage: input.percentage,
      coinsRequired: input.coinsRequired,
      description: input.description,
    },
  });
}

export async function deleteDiscountLevel(id: string): Promise<void> {
  const level = await prisma.discountLevel.findUnique({ where: { id } });
  if (!level) {
    throw new AppError("Nivel de descuento no encontrado", {
      code: "DISCOUNT_LEVEL_NOT_FOUND",
      statusCode: 404,
    });
  }
  await prisma.discountLevel.delete({ where: { id } });
}
