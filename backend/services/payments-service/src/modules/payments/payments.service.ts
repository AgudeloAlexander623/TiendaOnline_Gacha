// Lógica de negocio de pagos SIMULADOS.
//
// Reglas de negocio:
// - Las transiciones de estado son explícitas:
//   PENDING → APPROVED | REJECTED | CANCELLED ; APPROVED → REFUNDED.
// - Cada cambio relevante deja un `PaymentEvent` (auditoría).
// - Al aprobar un pago con recargas, estas pasan a COMPLETED.
// - TODO(economia): acreditar las monedas PURCHASED en el economy-service
//   al aprobar la recarga (integración pendiente entre microservicios).

import type { Payment, Recharge } from "../../generated/prisma/client.js";
import { config } from "../../config/config.js";
import { prisma } from "../../db/prisma.js";
import { AppError } from "../../shared/errors.js";
import type {
  CreatePaymentInput,
  ListPaymentsQuery,
  RefundInput,
} from "./payments.schemas.js";

type PaymentWithRecharges = Payment & { recharges: Recharge[] };

export interface PaymentView {
  id: string;
  userId: string;
  orderId: string | null;
  amount: number;
  currency: string;
  provider: string;
  status: string;
  externalId: string | null;
  failureReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  recharges?: Array<{ id: string; coins: number; status: string }>;
}

export function serializePayment(payment: PaymentWithRecharges): PaymentView {
  return {
    id: payment.id,
    userId: payment.userId,
    orderId: payment.orderId,
    amount: Number(payment.amount),
    currency: payment.currency,
    provider: payment.provider,
    status: payment.status,
    externalId: payment.externalId,
    failureReason: payment.failureReason,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
    recharges: payment.recharges.map((recharge) => ({
      id: recharge.id,
      coins: recharge.coins,
      status: recharge.status,
    })),
  };
}

export async function createPayment(
  userId: string,
  input: CreatePaymentInput,
): Promise<PaymentView> {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        userId,
        orderId: input.orderId ?? null,
        amount: input.amount,
        currency: input.currency ?? config.CURRENCY,
        provider: input.provider ?? "MOCK",
        status: "PENDING",
      },
      include: { recharges: true },
    });

    await tx.paymentEvent.create({
      data: {
        paymentId: payment.id,
        type: "CREATED",
        payload: { amount: Number(payment.amount), provider: payment.provider },
      },
    });

    return serializePayment(payment);
  });
}

export async function getPayment(
  id: string,
  requester: { id: string; role: string },
): Promise<PaymentView> {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { recharges: true },
  });
  if (!payment) {
    throw new AppError("Pago no encontrado", {
      code: "PAYMENT_NOT_FOUND",
      statusCode: 404,
    });
  }
  if (payment.userId !== requester.id && requester.role !== "ADMIN") {
    throw new AppError("No puedes ver este pago", {
      code: "FORBIDDEN",
      statusCode: 403,
    });
  }
  return serializePayment(payment);
}

export async function listMyPayments(
  userId: string,
  query: ListPaymentsQuery,
): Promise<{
  data: PaymentView[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
}> {
  const { page, pageSize, status } = query;
  const where = { userId, ...(status ? { status } : {}) };

  const [total, payments] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.findMany({
      where,
      include: { recharges: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    data: payments.map(serializePayment),
    meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  };
}

/** Simula la aprobación del pago por parte de la pasarela. */
export async function confirmPayment(
  id: string,
  requester: { id: string; role: string },
): Promise<PaymentView> {
  const payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment) {
    throw new AppError("Pago no encontrado", {
      code: "PAYMENT_NOT_FOUND",
      statusCode: 404,
    });
  }
  if (payment.userId !== requester.id && requester.role !== "ADMIN") {
    throw new AppError("No puedes confirmar este pago", {
      code: "FORBIDDEN",
      statusCode: 403,
    });
  }
  if (payment.status !== "PENDING") {
    throw new AppError("El pago no está pendiente", {
      code: "PAYMENT_NOT_PENDING",
      statusCode: 409,
    });
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.payment.update({
      where: { id },
      data: { status: "APPROVED", externalId: `mock_${id.slice(0, 8)}` },
      include: { recharges: true },
    });
    await tx.paymentEvent.create({
      data: { paymentId: id, type: "APPROVED", payload: { provider: updated.provider } },
    });
    await tx.recharge.updateMany({
      where: { paymentId: id, status: "PENDING" },
      data: { status: "COMPLETED" },
    });
    // TODO(economia): acreditar monedas PURCHASED en el economy-service.
    return serializePayment(updated);
  });
}

export async function refundPayment(
  id: string,
  input: RefundInput,
): Promise<PaymentView> {
  const payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment) {
    throw new AppError("Pago no encontrado", {
      code: "PAYMENT_NOT_FOUND",
      statusCode: 404,
    });
  }
  if (payment.status !== "APPROVED") {
    throw new AppError("Solo se pueden reembolsar pagos aprobados", {
      code: "PAYMENT_NOT_REFUNDABLE",
      statusCode: 409,
    });
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.payment.update({
      where: { id },
      data: { status: "REFUNDED" },
      include: { recharges: true },
    });
    await tx.refund.create({
      data: { paymentId: id, amount: payment.amount, reason: input.reason ?? null },
    });
    await tx.paymentEvent.create({
      data: { paymentId: id, type: "REFUNDED", payload: { reason: input.reason ?? null } },
    });
    await tx.recharge.updateMany({
      where: { paymentId: id },
      data: { status: "REFUNDED" },
    });
    return serializePayment(updated);
  });
}
