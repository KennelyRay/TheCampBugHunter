-- AlterTable
ALTER TABLE "rewards" ADD COLUMN     "command" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "reward_redemptions" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "minecraftUsername" TEXT NOT NULL,
    "rewardId" TEXT NOT NULL,
    "command" TEXT NOT NULL,
    "deliveredAt" TIMESTAMP(3),

    CONSTRAINT "reward_redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reward_redemptions_deliveredAt_createdAt_idx" ON "reward_redemptions"("deliveredAt", "createdAt");
