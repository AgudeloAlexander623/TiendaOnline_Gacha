// Lógica de negocio de los paquetes de monedas.

import type { CoinPackage } from "../../generated/prisma/client.js";
import { prisma } from "../../db/prisma.js";
import { AppError } from "../../shared/errors.js";
import type {
  CreatePackageInput,
  UpdatePackageInput,
} from "./packages.schemas.js";

export async function listPackages(onlyActive: boolean): Promise<CoinPackage[]> {
  return prisma.coinPackage.findMany({
    where: onlyActive ? { isActive: true } : {},
    orderBy: { coins: "asc" },
  });
}

export async function createPackage(
  input: CreatePackageInput,
): Promise<CoinPackage> {
  const existing = await prisma.coinPackage.findUnique({
    where: { slug: input.slug },
  });
  if (existing) {
    throw new AppError("Ya existe un paquete con ese slug", {
      code: "PACKAGE_SLUG_TAKEN",
      statusCode: 409,
    });
  }

  return prisma.coinPackage.create({
    data: {
      name: input.name,
      slug: input.slug,
      coins: input.coins,
      price: input.price,
      currency: input.currency,
    },
  });
}

export async function updatePackage(
  id: string,
  input: UpdatePackageInput,
): Promise<CoinPackage> {
  const existing = await prisma.coinPackage.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Paquete no encontrado", {
      code: "PACKAGE_NOT_FOUND",
      statusCode: 404,
    });
  }

  return prisma.coinPackage.update({
    where: { id },
    data: {
      name: input.name,
      coins: input.coins,
      price: input.price,
      currency: input.currency,
    },
  });
}

/** Baja lógica: un paquete con recargas asociadas no puede borrarse. */
export async function deactivatePackage(id: string): Promise<CoinPackage> {
  const existing = await prisma.coinPackage.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Paquete no encontrado", {
      code: "PACKAGE_NOT_FOUND",
      statusCode: 404,
    });
  }
  return prisma.coinPackage.update({
    where: { id },
    data: { isActive: false },
  });
}
