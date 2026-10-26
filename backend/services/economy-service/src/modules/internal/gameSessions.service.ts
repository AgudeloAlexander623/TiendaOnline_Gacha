// Validación de partidas de juego con endurecimiento (FR-BE-17).

import { prisma } from "../../db/prisma.js";
import { AppError } from "../../shared/errors.js";
import { creditCoins, getOrCreateWallet } from "../wallet/wallet.service.js";

const MAX_COINS_PER_SESSION = 500;
const EARNED_TTL_DAYS = 30;

function computeEarned(input: { gameType: string; outcome: string; score?: number | null }): number {
  if (input.gameType !== "MINIGAME") {
    return 0;
  }
  if (input.outcome !== "FINISHED") {
    return 0;
  }
  const score = input.score ?? 0;
  if (score <= 0) {
    return 0;
  }
  const earned = Math.floor(score * 1);
  return Math.min(earned, MAX_COINS_PER_SESSION);
}

export async function validateGameSessionInternal(sessionId: string, input: {
  userId: string;
  gameType: "GACHA" | "MINIGAME";
  outcome: "STARTED" | "FINISHED" | "ABANDONED" | "REJECTED";
  mapId?: string;
  enemiesDefeated?: number;
  bossesDefeated?: number;
  score?: number;
  itemsObtained?: Array<{ itemId: string; quantity: number }>;
  chestSaved?: boolean;
}) {
  const wallet = await getOrCreateWallet(input.userId);

  const session = await prisma.gameSession.findUnique({ where: { id: sessionId } });
  if (!session) {
    throw new AppError("Sesión de juego no encontrada", { code: "GAME_SESSION_NOT_FOUND", statusCode: 404 });
  }
  if (session.walletId !== wallet.id) {
    throw new AppError("Sesión ajena", { code: "FORBIDDEN", statusCode: 403 });
  }
  if (session.status !== "STARTED") {
    throw new AppError("La sesión ya fue validada", { code: "GAME_SESSION_ALREADY_PROCESSED", statusCode: 409 });
  }

  const earned = computeEarned({ gameType: input.gameType, outcome: input.outcome, score: input.score });

  const result = await prisma.$transaction(async (tx) => {
    let coinsAwarded = 0;
    let batchId: string | undefined;

    if (earned > 0 && input.outcome === "FINISHED") {
      const credit = await creditCoins(
        wallet.id,
        {
          type: "EARNED",
          amount: earned,
          source: "MINIGAME",
          expiresAt: new Date(Date.now() + EARNED_TTL_DAYS * 24 * 60 * 60 * 1000),
          referenceType: "gameSession",
          referenceId: sessionId,
          description: "Recompensa por partida de aventura",
        },
        tx,
      );
      coinsAwarded = earned;
      batchId = credit.batchId;
    }

    const updated = await tx.gameSession.update({
      where: { id: sessionId },
      data: {
        status: input.outcome === "ABANDONED" ? "ABANDONED" : input.outcome === "REJECTED" ? "REJECTED" : "FINISHED",
        score: input.score ?? null,
        coinsAwarded,
        mapId: input.mapId ?? null,
        enemiesDefeated: input.enemiesDefeated ?? null,
        bossesDefeated: input.bossesDefeated ?? null,
        itemsObtainedJson: input.itemsObtained ? (input.itemsObtained as any) : null,
        chestSaved: input.chestSaved ?? false,
        finishedAt: new Date(),
      },
    });

    return { updated, coinsAwarded, batchId };
  });

  return {
    sessionId,
    status: result.updated.status,
    earned: result.coinsAwarded,
    batchId: result.batchId,
    cappedBy: MAX_COINS_PER_SESSION,
    itemsRetained: input.outcome !== "ABANDONED",
  };
}
