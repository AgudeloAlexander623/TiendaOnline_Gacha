// Lógica de negocio del gacha.
//
// Reglas de negocio:
// - El servidor decide el premio (el cliente nunca lo elige).
// - Cada tirada debita monedas y queda registrada en `gacha_pulls`.
// - Los premios de monedas se acreditan como EARNED (caducan).
// - Los premios de objeto se guardan en el inventario del jugador.
//
// Nota: el resultado es aleatorio ponderado por `weight`. Para auditoría real
// convendría guardar la semilla del RNG (mejora futura).

import type { GachaReward } from "../../generated/prisma/client.js";
import { prisma } from "../../db/prisma.js";
import { AppError } from "../../shared/errors.js";
import { creditCoins, debitCoins, getOrCreateWallet } from "../wallet/wallet.service.js";

/**
 * Elige un premio por peso relativo. Es una función pura para poder probarla.
 * @param random valor en [0, 1).
 */
export function pickWeightedReward(
  rewards: ReadonlyArray<Pick<GachaReward, "weight">>,
  random: number,
): number | undefined {
  const total = rewards.reduce((acc, reward) => acc + Math.max(0, reward.weight), 0);
  if (total <= 0) {
    return undefined;
  }

  let threshold = random * total;
  for (let index = 0; index < rewards.length; index += 1) {
    const reward = rewards[index];
    if (!reward) {
      continue;
    }
    threshold -= Math.max(0, reward.weight);
    if (threshold < 0) {
      return index;
    }
  }
  return rewards.length - 1;
}

export async function listBanners() {
  return prisma.gachaBanner.findMany({
    where: { isActive: true },
    include: { rewards: { where: { isActive: true } } },
    orderBy: { createdAt: "asc" },
  });
}

export interface PullResult {
  pullId: string;
  banner: { id: string; name: string };
  costCoins: number;
  isWin: boolean;
  reward: {
    id: string;
    name: string;
    rarity: string;
    rewardType: string;
    coinValue: number | null;
    itemName: string | null;
  } | null;
  balance: number;
}

export async function pull(userId: string, bannerId: string): Promise<PullResult> {
  return prisma.$transaction(async (tx) => {
    const banner = await tx.gachaBanner.findUnique({
      where: { id: bannerId },
      include: { rewards: { where: { isActive: true } } },
    });

    if (!banner || !banner.isActive) {
      throw new AppError("Banner de gacha no encontrado", {
        code: "BANNER_NOT_FOUND",
        statusCode: 404,
      });
    }

    const now = new Date();
    if (banner.startsAt && banner.startsAt > now) {
      throw new AppError("El banner aún no está disponible", {
        code: "BANNER_NOT_STARTED",
        statusCode: 409,
      });
    }
    if (banner.endsAt && banner.endsAt < now) {
      throw new AppError("El banner ya finalizó", {
        code: "BANNER_ENDED",
        statusCode: 409,
      });
    }

    const wallet = await getOrCreateWallet(userId, tx);

    let balance = await debitCoins(
      wallet.id,
      {
        amount: banner.costPerPull,
        referenceType: "gacha_banner",
        referenceId: banner.id,
        description: `Tirada en ${banner.name}`,
      },
      tx,
    );

    const chosenIndex = pickWeightedReward(banner.rewards, Math.random());
    const reward = chosenIndex === undefined ? undefined : banner.rewards[chosenIndex];

    if (reward) {
      if (reward.rewardType === "COIN" && reward.coinValue) {
        balance = await creditCoins(
          wallet.id,
          {
            type: "EARNED",
            amount: reward.coinValue,
            source: `gacha:${banner.slug}`,
            referenceType: "gacha_reward",
            referenceId: reward.id,
            description: `Premio de gacha: ${reward.name}`,
          },
          tx,
        );
      } else if (reward.rewardType === "ITEM") {
        await tx.playerItem.create({
          data: {
            walletId: wallet.id,
            name: reward.itemName ?? reward.name,
            rarity: reward.rarity,
            source: "GACHA",
          },
        });
      }
    }

    const isWin = Boolean(reward && reward.rewardType !== "NOTHING");

    const created = await tx.gachaPull.create({
      data: {
        bannerId: banner.id,
        walletId: wallet.id,
        rewardId: reward?.id ?? null,
        costCoins: banner.costPerPull,
        isWin,
      },
    });

    return {
      pullId: created.id,
      banner: { id: banner.id, name: banner.name },
      costCoins: banner.costPerPull,
      isWin,
      reward: reward
        ? {
            id: reward.id,
            name: reward.name,
            rarity: reward.rarity,
            rewardType: reward.rewardType,
            coinValue: reward.coinValue,
            itemName: reward.itemName,
          }
        : null,
      balance,
    };
  });
}
