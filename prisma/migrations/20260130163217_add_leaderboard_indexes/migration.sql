-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "displayName" TEXT;

-- CreateIndex
CREATE INDEX "Player_biggestWin_idx" ON "Player"("biggestWin" DESC);

-- CreateIndex
CREATE INDEX "Player_handsPlayed_idx" ON "Player"("handsPlayed" DESC);

-- CreateIndex
CREATE INDEX "Player_totalWagered_idx" ON "Player"("totalWagered" DESC);
