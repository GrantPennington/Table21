-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bankrollCents" INTEGER NOT NULL DEFAULT 100000,
    "handsPlayed" INTEGER NOT NULL DEFAULT 0,
    "handsWon" INTEGER NOT NULL DEFAULT 0,
    "totalWagered" INTEGER NOT NULL DEFAULT 0,
    "biggestWin" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HandHistory" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "playerId" TEXT NOT NULL,
    "betCents" INTEGER NOT NULL,
    "netResultCents" INTEGER NOT NULL,
    "result" TEXT NOT NULL,
    "playerCards" TEXT NOT NULL,
    "dealerCards" TEXT NOT NULL,
    "playerTotal" INTEGER NOT NULL,
    "dealerTotal" INTEGER NOT NULL,
    "wasBlackjack" BOOLEAN NOT NULL DEFAULT false,
    "wasDouble" BOOLEAN NOT NULL DEFAULT false,
    "wasSplit" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "HandHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Player_createdAt_idx" ON "Player"("createdAt");

-- CreateIndex
CREATE INDEX "HandHistory_playerId_createdAt_idx" ON "HandHistory"("playerId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "HandHistory" ADD CONSTRAINT "HandHistory_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
