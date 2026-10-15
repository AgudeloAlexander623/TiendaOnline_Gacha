// Datos iniciales del economy-service (idempotente).
// Crea banners de gacha con sus premios ponderados.
// Uso: `npm run seed -w @gearquest/economy-service`.

import { prisma } from "../src/db/prisma.js";
import { logger } from "../src/shared/logger.js";

interface SeedReward {
  name: string;
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
  rewardType: "COIN" | "ITEM" | "NOTHING";
  coinValue?: number;
  itemName?: string;
  weight: number;
}

const BANNERS: Array<{
  slug: string;
  name: string;
  description: string;
  costPerPull: number;
  rewards: SeedReward[];
}> = [
  {
    slug: "capsula-nova",
    name: "Cápsula Nova",
    description: "Banner inicial con premios comunes y algunos objetos raros",
    costPerPull: 100,
    rewards: [
      { name: "Sin premio", rarity: "COMMON", rewardType: "NOTHING", weight: 20 },
      { name: "50 monedas", rarity: "COMMON", rewardType: "COIN", coinValue: 50, weight: 45 },
      { name: "150 monedas", rarity: "RARE", rewardType: "COIN", coinValue: 150, weight: 25 },
      { name: "Mousepad Edición Nova", rarity: "RARE", rewardType: "ITEM", itemName: "Mousepad Edición Nova", weight: 8 },
      { name: "Teclado Legendario", rarity: "LEGENDARY", rewardType: "ITEM", itemName: "Teclado Legendario", weight: 2 },
    ],
  },
  {
    slug: "capsula-audio",
    name: "Cápsula Audio",
    description: "Banner centrado en auriculares y monedas",
    costPerPull: 150,
    rewards: [
      { name: "Sin premio", rarity: "COMMON", rewardType: "NOTHING", weight: 15 },
      { name: "80 monedas", rarity: "COMMON", rewardType: "COIN", coinValue: 80, weight: 50 },
      { name: "300 monedas", rarity: "EPIC", rewardType: "COIN", coinValue: 300, weight: 20 },
      { name: "Auriculares StudioWave", rarity: "EPIC", rewardType: "ITEM", itemName: "Auriculares StudioWave", weight: 12 },
      { name: "Auriculares Legendarios", rarity: "LEGENDARY", rewardType: "ITEM", itemName: "Auriculares Legendarios", weight: 3 },
    ],
  },
];

async function main(): Promise<void> {
  for (const banner of BANNERS) {
    const existing = await prisma.gachaBanner.findUnique({
      where: { slug: banner.slug },
    });
    if (existing) {
      continue;
    }

    await prisma.gachaBanner.create({
      data: {
        slug: banner.slug,
        name: banner.name,
        description: banner.description,
        costPerPull: banner.costPerPull,
        rewards: {
          create: banner.rewards.map((reward) => ({
            name: reward.name,
            rarity: reward.rarity,
            rewardType: reward.rewardType,
            coinValue: reward.coinValue ?? null,
            itemName: reward.itemName ?? null,
            weight: reward.weight,
          })),
        },
      },
    });
    logger.info(`Banner asegurado: ${banner.name}`);
  }
}

main()
  .then(() => logger.info("Seed de economy-service completado"))
  .catch((error: unknown) => {
    logger.error({ err: error }, "Error durante el seed de economy-service");
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
