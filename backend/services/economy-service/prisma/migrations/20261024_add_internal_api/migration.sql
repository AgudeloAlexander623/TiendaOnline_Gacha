-- Migración: API interna de economy + idempotencia + campos de GameSession
CREATE TABLE IF NOT EXISTS "idempotency_keys" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "service" TEXT NOT NULL,
  "method" TEXT NOT NULL,
  "path" TEXT NOT NULL,
  "requestHash" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
  "statusCode" INTEGER,
  "responseBody" JSONB,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "idempotency_keys_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "idempotency_keys_key_service_path_key" ON "idempotency_keys"("key", "service", "path");
CREATE INDEX IF NOT EXISTS "idempotency_keys_expiresAt_idx" ON "idempotency_keys"("expiresAt");

ALTER TABLE "game_sessions" ADD COLUMN IF NOT EXISTS "mapId" TEXT;
ALTER TABLE "game_sessions" ADD COLUMN IF NOT EXISTS "enemiesDefeated" INTEGER;
ALTER TABLE "game_sessions" ADD COLUMN IF NOT EXISTS "bossesDefeated" INTEGER;
ALTER TABLE "game_sessions" ADD COLUMN IF NOT EXISTS "itemsObtainedJson" JSONB;
ALTER TABLE "game_sessions" ADD COLUMN IF NOT EXISTS "chestSaved" BOOLEAN NOT NULL DEFAULT false;
