// Lógica de negocio del inventario.
// Regla: cada cambio de stock genera un movimiento auditable (historial).

import { prisma } from "../../db/prisma.js";
import { AppError } from "../../shared/errors.js";
import type { AdjustStockInput } from "./inventory.schemas.js";

export interface InventoryView {
  productId: string;
  stock: number;
  reserved: number;
  available: number;
  updatedAt: Date;
}

async function ensureProduct(productId: string): Promise<void> {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new AppError("Producto no encontrado", {
      code: "PRODUCT_NOT_FOUND",
      statusCode: 404,
    });
  }
}

export async function getInventory(productId: string): Promise<InventoryView> {
  await ensureProduct(productId);
  const item = await prisma.inventoryItem.findUnique({ where: { productId } });
  if (!item) {
    throw new AppError("Inventario no encontrado para el producto", {
      code: "INVENTORY_NOT_FOUND",
      statusCode: 404,
    });
  }
  return {
    productId: item.productId,
    stock: item.stock,
    reserved: item.reserved,
    available: item.stock - item.reserved,
    updatedAt: item.updatedAt,
  };
}

export async function adjustStock(
  productId: string,
  input: AdjustStockInput,
): Promise<InventoryView> {
  await ensureProduct(productId);

  return prisma.$transaction(async (tx) => {
    const current =
      (await tx.inventoryItem.findUnique({ where: { productId } })) ??
      (await tx.inventoryItem.create({ data: { productId, stock: 0 } }));

    let nextStock = current.stock;
    if (input.type === "IN") {
      nextStock += input.quantity;
    } else if (input.type === "OUT") {
      if (input.quantity > current.stock) {
        throw new AppError("Stock insuficiente para la salida", {
          code: "INSUFFICIENT_STOCK",
          statusCode: 409,
        });
      }
      nextStock -= input.quantity;
    } else {
      nextStock = input.quantity;
    }

    const updated = await tx.inventoryItem.update({
      where: { productId },
      data: { stock: nextStock },
    });

    await tx.inventoryMovement.create({
      data: {
        productId,
        type: input.type,
        quantity: input.quantity,
        reason: input.reason ?? null,
      },
    });

    return {
      productId: updated.productId,
      stock: updated.stock,
      reserved: updated.reserved,
      available: updated.stock - updated.reserved,
      updatedAt: updated.updatedAt,
    };
  });
}
