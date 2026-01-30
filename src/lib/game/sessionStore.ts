import { randomUUID } from 'crypto';
import { cookies } from 'next/headers';
import { createGameSessionToken, verifyGameSessionToken } from '@/lib/identity/cookies';
import { Shoe, createShoe, shuffleShoe } from '@/lib/engine/shoe';
import { RoundState, Rules, DEFAULT_RULES } from '@/lib/types';
import { getOrCreatePlayer, updatePlayerBankroll } from '@/lib/db';
import { prisma } from '@/lib/db/prisma';

export const GAME_SESSION_COOKIE = 'game_session';

const DEFAULT_BANKROLL_CENTS = parseInt(process.env.DEFAULT_BANKROLL_CENTS || '100000', 10);
const SESSION_TTL_MS = 60 * 60 * 1000; // 1 hour

export type UIPrefs = {
  soundEnabled: boolean;
  animationsEnabled: boolean;
};

export type GameSession = {
  sessionId: string;
  playerId: string;
  shoe: Shoe;
  roundState: RoundState | null;
  bankrollCents: number;
  rules: Rules;
  uiPrefs: UIPrefs;
  updatedAt: number;
};

// In-memory cache for performance (optional fallback if DB unavailable)
const sessionCache = new Map<string, GameSession>();

/**
 * Load session from database
 */
async function loadSessionFromDb(sessionId: string): Promise<GameSession | null> {
  if (!prisma) return null;

  try {
    const dbSession = await prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: { player: { select: { bankrollCents: true } } },
    });

    if (!dbSession) return null;

    return {
      sessionId: dbSession.id,
      playerId: dbSession.playerId,
      shoe: JSON.parse(dbSession.shoe) as Shoe,
      roundState: dbSession.roundState ? JSON.parse(dbSession.roundState) as RoundState : null,
      bankrollCents: dbSession.player.bankrollCents,
      rules: JSON.parse(dbSession.rules) as Rules,
      uiPrefs: { soundEnabled: true, animationsEnabled: true },
      updatedAt: dbSession.updatedAt.getTime(),
    };
  } catch (error) {
    console.error('Failed to load session from database:', error);
    return null;
  }
}

/**
 * Save session to database
 */
async function saveSessionToDb(session: GameSession): Promise<void> {
  if (!prisma) return;

  try {
    await prisma.gameSession.upsert({
      where: { id: session.sessionId },
      update: {
        shoe: JSON.stringify(session.shoe),
        roundState: session.roundState ? JSON.stringify(session.roundState) : null,
        rules: JSON.stringify(session.rules),
      },
      create: {
        id: session.sessionId,
        playerId: session.playerId,
        shoe: JSON.stringify(session.shoe),
        roundState: session.roundState ? JSON.stringify(session.roundState) : null,
        rules: JSON.stringify(session.rules),
      },
    });
  } catch (error) {
    console.error('Failed to save session to database:', error);
  }
}

/**
 * Clean up stale sessions from database
 */
async function cleanupStaleSessions(): Promise<void> {
  if (!prisma) return;

  try {
    const cutoff = new Date(Date.now() - SESSION_TTL_MS);
    await prisma.gameSession.deleteMany({
      where: { updatedAt: { lt: cutoff } },
    });
  } catch (error) {
    console.error('Failed to cleanup stale sessions:', error);
  }
}

/**
 * Get or create a game session
 */
export async function getOrCreateGameSession(playerId: string): Promise<GameSession> {
  // Cleanup stale sessions periodically (1% chance)
  if (Math.random() < 0.01) {
    cleanupStaleSessions().catch(() => {});
  }

  const cookieStore = await cookies();
  const existingToken = cookieStore.get(GAME_SESSION_COOKIE)?.value;

  // Try to load existing session
  if (existingToken) {
    const sessionId = verifyGameSessionToken(existingToken);
    if (sessionId) {
      // Try database first
      const dbSession = await loadSessionFromDb(sessionId);
      if (dbSession && dbSession.playerId === playerId) {
        // Cache it
        sessionCache.set(sessionId, dbSession);
        return dbSession;
      }

      // Fallback to cache (for non-DB mode)
      const cachedSession = sessionCache.get(sessionId);
      if (cachedSession && cachedSession.playerId === playerId) {
        cachedSession.updatedAt = Date.now();
        return cachedSession;
      }
    }
  }

  // Create new session
  const sessionId = randomUUID();
  const shoe = shuffleShoe(createShoe(DEFAULT_RULES.numDecks));

  // Load bankroll from database if available
  let bankrollCents = DEFAULT_BANKROLL_CENTS;
  if (prisma) {
    try {
      const player = await getOrCreatePlayer(playerId);
      bankrollCents = player.bankrollCents;
    } catch (error) {
      console.error('Failed to load player from database:', error);
    }
  }

  const session: GameSession = {
    sessionId,
    playerId,
    shoe,
    roundState: null,
    bankrollCents,
    rules: DEFAULT_RULES,
    uiPrefs: {
      soundEnabled: true,
      animationsEnabled: true,
    },
    updatedAt: Date.now(),
  };

  // Save to database
  await saveSessionToDb(session);

  // Cache it
  sessionCache.set(sessionId, session);

  // Set cookie
  const token = createGameSessionToken(sessionId);
  cookieStore.set(GAME_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60, // 1 hour
    path: '/',
  });

  return session;
}

/**
 * Get an existing game session by ID
 */
export function getGameSession(sessionId: string): GameSession | null {
  return sessionCache.get(sessionId) || null;
}

/**
 * Update a game session (saves to both cache and database)
 */
export function updateGameSession(session: GameSession): void {
  session.updatedAt = Date.now();
  sessionCache.set(session.sessionId, session);

  // Save to database (fire and forget for performance, but log errors)
  saveSessionToDb(session).catch((error) => {
    console.error('Failed to persist session update:', error);
  });
}

/**
 * Sync session bankroll to database
 */
export async function syncBankrollToDb(session: GameSession): Promise<void> {
  if (!prisma) return;

  try {
    await updatePlayerBankroll(session.playerId, session.bankrollCents);
  } catch (error) {
    console.error('Failed to sync bankroll to database:', error);
  }
}

/**
 * Delete a game session
 */
export async function deleteGameSession(sessionId: string): Promise<void> {
  sessionCache.delete(sessionId);

  if (prisma) {
    try {
      await prisma.gameSession.delete({ where: { id: sessionId } });
    } catch (error) {
      // Ignore if not found
    }
  }
}

/**
 * Get session count (for debugging)
 */
export function getSessionCount(): number {
  return sessionCache.size;
}
