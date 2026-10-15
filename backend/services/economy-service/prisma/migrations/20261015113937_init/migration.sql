-- CreateEnum
CREATE TYPE "CoinType" AS ENUM ('EARNED', 'PURCHASED');

-- CreateEnum
CREATE TYPE "CoinBatchStatus" AS ENUM ('ACTIVE', 'DEPLETED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "CoinTransactionType" AS ENUM ('CREDIT', 'DEBIT', 'EXPIRE', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "Rarity" AS ENUM ('COMMON', 'RARE', 'EPIC', 'LEGENDARY');

-- CreateEnum
CREATE TYPE "GachaRewardType" AS ENUM ('COIN', 'ITEM', 'NOTHING');

-- CreateEnum
CREATE TYPE "GameType" AS ENUM ('GACHA', 'MINIGAME');

-- CreateEnum
CREATE TYPE "GameSessionStatus" AS ENUM ('STARTED', 'FINISHED', 'ABANDONED', 'REJECTED');

-- CreateTable
CREATE TABLE "wallets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coin_batches" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "type" "CoinType" NOT NULL,
    "source" TEXT NOT NULL,
    "originalAmount" INTEGER NOT NULL,
    "remainingAmount" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "status" "CoinBatchStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coin_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coin_transactions" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "type" "CoinTransactionType" NOT NULL,
    "coinType" "CoinType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coin_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gacha_banners" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "costPerPull" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gacha_banners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gacha_rewards" (
    "id" TEXT NOT NULL,
    "bannerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rarity" "Rarity" NOT NULL,
    "rewardType" "GachaRewardType" NOT NULL,
    "coinValue" INTEGER,
    "itemName" TEXT,
    "weight" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gacha_rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gacha_pulls" (
    "id" TEXT NOT NULL,
    "bannerId" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "rewardId" TEXT,
    "costCoins" INTEGER NOT NULL,
    "isWin" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gacha_pulls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_items" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rarity" "Rarity" NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "source" "GameType" NOT NULL,
    "acquiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "player_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_sessions" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "gameType" "GameType" NOT NULL,
    "status" "GameSessionStatus" NOT NULL DEFAULT 'STARTED',
    "score" INTEGER,
    "coinsAwarded" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "game_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wallets_userId_key" ON "wallets"("userId");

-- CreateIndex
CREATE INDEX "coin_batches_walletId_idx" ON "coin_batches"("walletId");

-- CreateIndex
CREATE INDEX "coin_batches_expiresAt_idx" ON "coin_batches"("expiresAt");

-- CreateIndex
CREATE INDEX "coin_transactions_walletId_idx" ON "coin_transactions"("walletId");

-- CreateIndex
CREATE UNIQUE INDEX "gacha_banners_slug_key" ON "gacha_banners"("slug");

-- CreateIndex
CREATE INDEX "gacha_rewards_bannerId_idx" ON "gacha_rewards"("bannerId");

-- CreateIndex
CREATE INDEX "gacha_pulls_bannerId_idx" ON "gacha_pulls"("bannerId");

-- CreateIndex
CREATE INDEX "gacha_pulls_walletId_idx" ON "gacha_pulls"("walletId");

-- CreateIndex
CREATE INDEX "player_items_walletId_idx" ON "player_items"("walletId");

-- CreateIndex
CREATE INDEX "game_sessions_walletId_idx" ON "game_sessions"("walletId");

-- AddForeignKey
ALTER TABLE "coin_batches" ADD CONSTRAINT "coin_batches_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coin_transactions" ADD CONSTRAINT "coin_transactions_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gacha_rewards" ADD CONSTRAINT "gacha_rewards_bannerId_fkey" FOREIGN KEY ("bannerId") REFERENCES "gacha_banners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gacha_pulls" ADD CONSTRAINT "gacha_pulls_bannerId_fkey" FOREIGN KEY ("bannerId") REFERENCES "gacha_banners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gacha_pulls" ADD CONSTRAINT "gacha_pulls_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gacha_pulls" ADD CONSTRAINT "gacha_pulls_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "gacha_rewards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_items" ADD CONSTRAINT "player_items_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
