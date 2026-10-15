// Lógica de negocio de recargas SIMULADAS.
//
// Una recarga crea un pago PENDING vinculado a un paquete de monedas.
// Al aprobarse el pago (payments.service.confirmPayment), la recarga pasa a
// COMPLETED y (a futuro) se acreditan las monedas en el economy-service.

import { config } from "../../config/config.js";
import { prisma } from "../../db/prisma.js";
import { AppError } from "../../shared/errors.js";
import { serializePayment, type PaymentView } from "../payments/payments.service.js";
import type { CreateRechargeInput, ListRechargesQuery } from "./recharges.schemas.js";

export interface CreateRechargeResult {
  payment: PaymentView;
  recharge: {
    id: string;
    packageId: string;
    coins: number;
    status: string;
  };
}

export async function createRecharge(
  userId: string,
  input: CreateRechargeInput,
): Promise<CreateRechargeResult> {
  const coinPackage = await prisma.coinPackage.findUnique({
    where: { id: input.packageId },
  });
  if (!coinPackage || !coinPackage.isActive) {
    throw new AppError("Paquete de monedas no encontrado", {
      code: "PACKAGE_NOT_FOUND",
      statusCode: 404,
    });
  }

  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        userId,
        amount: coinPackage.price,
        currency: coinPackage.currency,
        provider: config.PAYMENT_PROVIDER.toUpperCase() as
          | "MOCK"
          | "STRIPE"
          | "MERCADOPAGO",
        status: "PENDING",
      },
      include: { recharges: true },
    });

    await tx.paymentEvent.create({
      data: {
        paymentId: payment.id,
        type: "CREATED",
        payload: { packageId: coinPackage.id, coins: coinPackage.coins },
      },
    });

    const recharge = await tx.recharge.create({
      data: {
        userId,
        packageId: coinPackage.id,
        paymentId: payment.id,
        coins: coinPackage.coins,
        amountPaid: coinPackage.price,
        currency: coinPackage.currency,
        status: "PENDING",
      },
    });

    return {
      payment: serializePayment(payment),
      recharge: {
        id: recharge.id,
        packageId: recharge.packageId,
        coins: recharge.coins,
        status: recharge.status,
      },
    };
  });
}

export async function listMyRecharges(
  userId: string,
  query: ListRechargesQuery,
) {
  const { page, pageSize, status } = query;
  const where = { userId, ...(status ? { status } : {}) };

  const [total, recharges] = await Promise.all([
    prisma.recharge.count({ where }),
    prisma.recharge.findMany({
      where,
      include: { package: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    data: recharges.map((recharge) => ({
      id: recharge.id,
      packageId: recharge.packageId,
      packageName: recharge.package.name,
      coins: recharge.coins,
      amountPaid: Number(recharge.amountPaid),
      currency: recharge.currency,
      status: recharge.status,
      createdAt: recharge.createdAt,
    })),
    meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  };
}
