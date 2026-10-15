// Lógica de negocio de recompensas por minijuegos.
//
// Reglas de negocio:
// - El servidor otorga las monedas: el cliente solo envía su puntaje.
// - Las monedas ganadas son EARNED y caducan (EARNED_COINS_TTL_DAYS).
// - Cada partida queda registrada como `game_session`.
//
// Nota anti-trampa: la validación real de la partida contra el juego (Godot)
// está pendiente; hoy se aplica una regla simple de conversión puntaje→monedas.

import { prisma } from "../../db/prisma.js";
import { AppError } from "../../shared/errors.js";
import { creditCoins, getOrCreateWallet } from "../wallet/wallet.service.js";
import type {
  FinishSessionInput,
  StartSessionInput,
} from "./rewards.schemas.js";

/** Regla de conversión puntaje → monedas (máximo 500 monedas por partida). */
export function scoreToCoins(score: number): number {
  return Math.min(Math.floor(score / 10), 500);
}

export async function startSession(userId: string, input: StartSessionInput) {
  const wallet = await getOrCreateWallet(userId);
  return prisma.gameSession.create({
    data: { walletId: wallet.id, gameType: input.gameType, status: "STARTED" },
  });
}

export async function finishSession(
  userId: string,
  sessionId: string,
  input: FinishSessionInput,
) {
  const wallet = await getOrCreateWallet(userId);
  const session = await prisma.gameSession.findUnique({
    where: { id: sessionId },
  });

  if (!session || session.walletId !== wallet.id) {
    throw new AppError("Sesión de juego no encontrada", {
      code: "GAME_SESSION_NOT_FOUND",
      statusCode: 404,
    });
  }
  if (session.status !== "STARTED") {
    throw new AppError("La sesión ya fue finalizada", {
      code: "GAME_SESSION_CLOSED",
      statusCode: 409,
    });
  }

  const coinsAwarded = scoreToCoins(input.score);

  return prisma.$transaction(async (tx) => {
    if (coinsAwarded > 0) {
      await creditCoins(
        wallet.id,
        {
          type: "EARNED",
          amount: coinsAwarded,
          source: "minigame",
          referenceType: "game_session",
          referenceId: session.id,
          description: `Recompensa por minijuego (puntaje ${input.score})`,
        },
        tx,
      );
    }

    return tx.gameSession.update({
      where: { id: session.id },
      data: {
        status: "FINISHED",
        score: input.score,
        coinsAwarded,
        finishedAt: new Date(),
      },
    });
  });
}

export async function listMySessions(userId: string) {
  const wallet = await getOrCreateWallet(userId);
  return prisma.gameSession.findMany({
    where: { walletId: wallet.id },
    orderBy: { startedAt: "desc" },
    take: 50,
  });
}
