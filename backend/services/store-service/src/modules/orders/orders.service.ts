// Lógica de negocio de pedidos (checkout desde el carrito).
// Reglas de negocio:
// - El checkout descuenta stock y registra movimientos OUT en una transacción.
// - El carrito pasa a CHECKED_OUT (no se reutiliza).
// - El descuento por monedas se calcula aquí, pero el débito real de monedas
//   corresponde al economy-service (integración pendiente, marcada con TODO).

import { randomUUID } from "node:crypto";
import type { Order, OrderItem } from "../../generated/prisma/client.js";
import { prisma } from "../../db/prisma.js";
import { AppError } from "../../shared/errors.js";
import type {
  CheckoutInput,
  ListOrdersQuery,
  UpdateOrderStatusInput,
} from "./orders.schemas.js";

type OrderWithItems = Order & { items: OrderItem[] };

export interface OrderView {
  id: string;
  orderNumber: string;
  userId: string;
  status: string;
  subtotal: number;
  discountAmount: number;
  total: number;
  currency: string;
  items: Array<{
    id: string;
    productId: string;
    nameSnapshot: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export function serializeOrder(order: OrderWithItems): OrderView {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    userId: order.userId,
    status: order.status,
    subtotal: Number(order.subtotal),
    discountAmount: Number(order.discountAmount),
    total: Number(order.total),
    currency: order.currency,
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      nameSnapshot: item.nameSnapshot,
      unitPrice: Number(item.unitPrice),
      quantity: item.quantity,
      lineTotal: Number(item.lineTotal),
    })),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

export async function checkout(
  userId: string,
  input: CheckoutInput,
): Promise<OrderView> {
  const cart = await prisma.cart.findFirst({
    where: { userId, status: "ACTIVE" },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) {
    throw new AppError("El carrito está vacío", {
      code: "CART_EMPTY",
      statusCode: 409,
    });
  }

  let discountPercentage = 0;
  if (input.discountLevelId) {
    const level = await prisma.discountLevel.findUnique({
      where: { id: input.discountLevelId },
    });
    if (!level || !level.isActive) {
      throw new AppError("Nivel de descuento inválido", {
        code: "DISCOUNT_LEVEL_INVALID",
        statusCode: 400,
      });
    }
    // TODO(economia): validar y debitar `level.coinsRequired` en el economy-service
    // antes de aplicar el descuento. Hoy el canje de monedas aún no está conectado.
    discountPercentage = level.percentage;
  }

  const subtotal = cart.items.reduce(
    (acc, item) => acc + Number(item.unitPrice) * item.quantity,
    0,
  );
  const discountAmount = Math.round(subtotal * discountPercentage) / 100;
  const total = subtotal - discountAmount;
  const currency = cart.items[0]?.product.currency ?? "COP";
  const orderNumber = `GQ-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`;

  return prisma.$transaction(async (tx) => {
    for (const item of cart.items) {
      const inventory = await tx.inventoryItem.findUnique({
        where: { productId: item.productId },
      });
      const available = inventory ? inventory.stock - inventory.reserved : 0;
      if (available < item.quantity) {
        throw new AppError(`Stock insuficiente para ${item.product.name}`, {
          code: "INSUFFICIENT_STOCK",
          statusCode: 409,
        });
      }
    }

    const order = await tx.order.create({
      data: {
        orderNumber,
        userId,
        status: "PENDING",
        subtotal,
        discountAmount,
        total,
        currency,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            nameSnapshot: item.product.name,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            lineTotal: Number(item.unitPrice) * item.quantity,
          })),
        },
      },
      include: { items: true },
    });

    for (const item of cart.items) {
      await tx.inventoryItem.update({
        where: { productId: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
      await tx.inventoryMovement.create({
        data: {
          productId: item.productId,
          type: "OUT",
          quantity: item.quantity,
          reason: `Pedido ${orderNumber}`,
        },
      });
    }

    await tx.cart.update({
      where: { id: cart.id },
      data: { status: "CHECKED_OUT" },
    });

    return serializeOrder(order);
  });
}

export async function listMyOrders(
  userId: string,
  query: ListOrdersQuery,
): Promise<{
  data: OrderView[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
}> {
  const { page, pageSize, status } = query;
  const where = { userId, ...(status ? { status } : {}) };

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    data: orders.map(serializeOrder),
    meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  };
}

export async function getOrder(
  orderId: string,
  requester: { id: string; role: string },
): Promise<OrderView> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) {
    throw new AppError("Pedido no encontrado", {
      code: "ORDER_NOT_FOUND",
      statusCode: 404,
    });
  }
  if (order.userId !== requester.id && requester.role !== "ADMIN") {
    throw new AppError("No puedes ver este pedido", {
      code: "FORBIDDEN",
      statusCode: 403,
    });
  }
  return serializeOrder(order);
}

export async function listAllOrders(query: ListOrdersQuery): Promise<{
  data: OrderView[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
}> {
  const { page, pageSize, status } = query;
  const where = status ? { status } : {};

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    data: orders.map(serializeOrder),
    meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  };
}

export async function updateOrderStatus(
  orderId: string,
  input: UpdateOrderStatusInput,
): Promise<OrderView> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    throw new AppError("Pedido no encontrado", {
      code: "ORDER_NOT_FOUND",
      statusCode: 404,
    });
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: input.status },
    include: { items: true },
  });
  return serializeOrder(updated);
}
