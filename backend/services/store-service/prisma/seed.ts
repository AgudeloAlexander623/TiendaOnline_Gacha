// Datos iniciales del store-service (idempotente).
// Crea categorías, productos de ejemplo y los niveles de descuento base.
// Uso: `npm run seed -w @gearquest/store-service`.

import { prisma } from "../src/db/prisma.js";
import { logger } from "../src/shared/logger.js";

const CATEGORIES = [
  { name: "Teclados", slug: "teclados", description: "Teclados mecánicos y de membrana" },
  { name: "Ratones", slug: "ratones", description: "Ratones gamer y de oficina" },
  { name: "Auriculares", slug: "auriculares", description: "Audio para juego y música" },
  { name: "Mousepads", slug: "mousepads", description: "Superficies para el ratón" },
];

const PRODUCTS = [
  { sku: "KB-001", name: "Teclado Mecánico Nova", slug: "teclado-mecanico-nova", price: 320000, categorySlug: "teclados", stock: 25 },
  { sku: "KB-002", name: "Teclado 60% Compacto", slug: "teclado-60-compacto", price: 210000, categorySlug: "teclados", stock: 18 },
  { sku: "MS-001", name: "Ratón Óptico Pulse", slug: "raton-optico-pulse", price: 150000, categorySlug: "ratones", stock: 40 },
  { sku: "MS-002", name: "Ratón Inalámbrico Glide", slug: "raton-inalambrico-glide", price: 190000, categorySlug: "ratones", stock: 12 },
  { sku: "HP-001", name: "Auriculares StudioWave", slug: "auriculares-studiowave", price: 430000, categorySlug: "auriculares", stock: 9 },
  { sku: "MP-001", name: "Mousepad XL Speed", slug: "mousepad-xl-speed", price: 80000, categorySlug: "mousepads", stock: 60 },
];

const DISCOUNT_LEVELS = [
  { level: 1, percentage: 10, coinsRequired: 100, description: "Descuento inicial" },
  { level: 2, percentage: 30, coinsRequired: 500, description: "Descuento intermedio" },
  { level: 3, percentage: 50, coinsRequired: 1500, description: "Descuento alto" },
  { level: 4, percentage: 70, coinsRequired: 4000, description: "Descuento muy alto" },
  { level: 5, percentage: 90, coinsRequired: 10000, description: "Descuento máximo" },
];

async function main(): Promise<void> {
  for (const category of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  for (const product of PRODUCTS) {
    const category = await prisma.category.findUnique({
      where: { slug: product.categorySlug },
    });
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: {
        sku: product.sku,
        name: product.name,
        slug: product.slug,
        price: product.price,
        currency: "COP",
        categoryId: category?.id ?? null,
        inventory: { create: { stock: product.stock } },
      },
    });
  }

  for (const level of DISCOUNT_LEVELS) {
    await prisma.discountLevel.upsert({
      where: { level: level.level },
      update: {},
      create: level,
    });
  }

  logger.info(
    `Seed de store-service completado: ${CATEGORIES.length} categorías, ${PRODUCTS.length} productos, ${DISCOUNT_LEVELS.length} niveles de descuento`,
  );
}

main()
  .then(() => undefined)
  .catch((error: unknown) => {
    logger.error({ err: error }, "Error durante el seed de store-service");
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
