import { prisma } from './prisma';
import { Card } from '@/lib/types';

const MAX_HISTORY_PER_PLAYER = 50;

export type HandHistoryEntry = {
  id: string;
  createdAt: Date;
  betCents: number;
  netResultCents: number;
  result: string;
  playerCards: Card[];
  dealerCards: Card[];
  playerTotal: number;
  dealerTotal: number;
  wasBlackjack: boolean;
  wasDouble: boolean;
  wasSplit: boolean;
};

export type RecordHandParams = {
  playerId: string;
  betCents: number;
  netResultCents: number;
  result: string; // WIN, LOSS, PUSH, BJ, SURRENDER
  playerCards: Card[];
  dealerCards: Card[];
  playerTotal: number;
  dealerTotal: number;
  wasBlackjack?: boolean;
  wasDouble?: boolean;
  wasSplit?: boolean;
};

/**
 * Record a hand in history and prune old entries
 */
export async function recordHand(params: RecordHandParams): Promise<void> {
  if (!prisma) return;

  const {
    playerId,
    betCents,
    netResultCents,
    result,
    playerCards,
    dealerCards,
    playerTotal,
    dealerTotal,
    wasBlackjack = false,
    wasDouble = false,
    wasSplit = false,
  } = params;

  // Insert new hand
  await prisma.handHistory.create({
    data: {
      playerId,
      betCents,
      netResultCents,
      result,
      playerCards: JSON.stringify(playerCards),
      dealerCards: JSON.stringify(dealerCards),
      playerTotal,
      dealerTotal,
      wasBlackjack,
      wasDouble,
      wasSplit,
    },
  });

  // Prune old entries (keep only last MAX_HISTORY_PER_PLAYER)
  const oldEntries = await prisma.handHistory.findMany({
    where: { playerId },
    orderBy: { createdAt: 'desc' },
    skip: MAX_HISTORY_PER_PLAYER,
    select: { id: true },
  });

  if (oldEntries.length > 0) {
    await prisma.handHistory.deleteMany({
      where: {
        id: { in: oldEntries.map((e) => e.id) },
      },
    });
  }
}

/**
 * Get player's hand history
 */
export async function getHandHistory(
  playerId: string,
  limit: number = 20
): Promise<HandHistoryEntry[]> {
  if (!prisma) return [];

  const entries = await prisma.handHistory.findMany({
    where: { playerId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return entries.map((entry) => ({
    id: entry.id,
    createdAt: entry.createdAt,
    betCents: entry.betCents,
    netResultCents: entry.netResultCents,
    result: entry.result,
    playerCards: JSON.parse(entry.playerCards) as Card[],
    dealerCards: JSON.parse(entry.dealerCards) as Card[],
    playerTotal: entry.playerTotal,
    dealerTotal: entry.dealerTotal,
    wasBlackjack: entry.wasBlackjack,
    wasDouble: entry.wasDouble,
    wasSplit: entry.wasSplit,
  }));
}
