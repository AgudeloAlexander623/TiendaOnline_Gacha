// Lógica de negocio del carrito de compras.
// Reglas:
// - Un usuario tiene un solo carrito ACTIVE.
// - Al agregar un ítem se guarda el precio unitario vigente (snapshot).
// - El total del carrito se calcula en el servidor.

import { prisma } from "../../db/prisma.js";
import { AppError } from "../../shared/errors.js";
import type { AddCartItemInput, UpdateCartItemInput } from "./carts.schemas.js";

export interface CartView {
  cartId: string;
  status: string;
  items: Array<{
    id: string;
    productId: string;
    name: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }>;
  subtotal: number;
  currency: string;
  totalItems: number;
}

async function getOrCreateActiveCart(userId: string): Promise<{ id: string }> {
  const existing = await prisma.cart.findFirst({
    where: { userId, status: "ACTIVE" },
    select: { id: true },
  });
  if (existing) {
    return existing;
  }
  return prisma.cart.create({ data: { userId }, select: { id: true } });
}

async function buildCartView(cartId: string): Promise<CartView> {
  const cart = await prisma.cart.findUniqueOrThrow({
    where: { id: cartId },
    include: { items: { include: { product: true }, orderBy: { id: "asc" } } },
  });

  const items = cart.items.map((item) => ({
    id: item.id,
    productId: item.productId,
    name: item.product.name,
    unitPrice: Number(item.unitPrice),
    quantity: item.quantity,
    lineTotal: Number(item.unitPrice) * item.quantity,
  }));

  return {
    cartId: cart.id,
    status: cart.status,
    items,
    subtotal: items.reduce((acc, item) => acc + item.lineTotal, 0),
    currency: cart.items[0]?.product.currency ?? "COP",
    totalItems: items.reduce((acc, item) => acc + item.quantity, 0),
  };
}

export async function getMyCart(userId: string): Promise<CartView> {
  const cart = await getOrCreateActiveCart(userId);
  return buildCartView(cart.id);
}

export async function addItem(
  userId: string,
  input: AddCartItemInput,
): Promise<CartView> {
  const product = await prisma.product.findUnique({
    where: { id: input.productId },
    include: { inventory: true },
  });
  if (!product || !product.isActive) {
    throw new AppError("Producto no disponible", {
      code: "PRODUCT_NOT_AVAILABLE",
      statusCode: 404,
    });
  }

  const available = product.inventory
    ? product.inventory.stock - product.inventory.reserved
    : 0;
  if (available < input.quantity) {
    throw new AppError("No hay stock suficiente", {
      code: "INSUFFICIENT_STOCK",
      statusCode: 409,
    });
  }

  const cart = await getOrCreateActiveCart(userId);

  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId: input.productId } },
    update: { quantity: { increment: input.quantity } },
    create: {
      cartId: cart.id,
      productId: input.productId,
      quantity: input.quantity,
      unitPrice: product.price,
    },
  });

  return buildCartView(cart.id);
}

export async function updateItem(
  userId: string,
  itemId: string,
  input: UpdateCartItemInput,
): Promise<CartView> {
  const cart = await getOrCreateActiveCart(userId);
  const item = await prisma.cartItem.findUnique({ where: { id: itemId } });
  if (!item || item.cartId !== cart.id) {
    throw new AppError("Ítem no encontrado en el carrito", {
      code: "CART_ITEM_NOT_FOUND",
      statusCode: 404,
    });
  }

  await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity: input.quantity },
  });
  return buildCartView(cart.id);
}

export async function removeItem(
  userId: string,
  itemId: string,
): Promise<CartView> {
  const cart = await getOrCreateActiveCart(userId);
  const item = await prisma.cartItem.findUnique({ where: { id: itemId } });
  if (!item || item.cartId !== cart.id) {
    throw new AppError("Ítem no encontrado en el carrito", {
      code: "CART_ITEM_NOT_FOUND",
      statusCode: 404,
    });
  }

  await prisma.cartItem.delete({ where: { id: itemId } });
  return buildCartView(cart.id);
}

export async function clearCart(userId: string): Promise<CartView> {
  const cart = await getOrCreateActiveCart(userId);
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  return buildCartView(cart.id);
}
