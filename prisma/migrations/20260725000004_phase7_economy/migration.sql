-- CreateTable
CREATE TABLE "daily_reward_claims" (
    "id" SERIAL NOT NULL,
    "walletId" INTEGER NOT NULL,
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_reward_claims_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_reward_claims_walletId_key" ON "daily_reward_claims"("walletId");

-- AddForeignKey
ALTER TABLE "daily_reward_claims" ADD CONSTRAINT "daily_reward_claims_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
