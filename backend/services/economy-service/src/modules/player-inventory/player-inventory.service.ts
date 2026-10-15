// Inventario de objetos del jugador (premios de gacha, etc.).

import { prisma } from "../../db/prisma.js";
import { getOrCreateWallet } from "../wallet/wallet.service.js";

export async function listPlayerItems(userId: string) {
  const wallet = await getOrCreateWallet(userId);
  return prisma.playerItem.findMany({
    where: { walletId: wallet.id },
    orderBy: { acquiredAt: "desc" },
  });
}
