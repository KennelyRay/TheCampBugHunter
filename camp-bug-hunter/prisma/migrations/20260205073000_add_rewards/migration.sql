-- AlterTable
ALTER TABLE "users" ADD COLUMN     "reward_balance" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "rewards" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "cost" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "iconUrl" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "rewards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rewards_active_cost_idx" ON "rewards"("active", "cost");
