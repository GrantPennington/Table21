import { NextResponse } from 'next/server';
import { getOrCreatePlayerId } from '@/lib/identity';
import { getOrCreateGameSession, updateGameSession } from '@/lib/game';
import { createShoe, shuffleShoe } from '@/lib/engine/shoe';
import { resetPlayer } from '@/lib/db';

export async function POST() {
  try {
    const playerId = await getOrCreatePlayerId();
    const session = await getOrCreateGameSession(playerId);

    // Reset session to fresh state
    const DEFAULT_BANKROLL_CENTS = parseInt(process.env.DEFAULT_BANKROLL_CENTS || '100000', 10);
    session.bankrollCents = DEFAULT_BANKROLL_CENTS;
    session.roundState = null;
    session.shoe = shuffleShoe(createShoe(session.rules.numDecks));
    updateGameSession(session);

    // Reset player in database if configured
    if (process.env.DATABASE_URL) {
      try {
        await resetPlayer(playerId);
      } catch (error) {
        console.error('Failed to reset player in database:', error);
      }
    }

    return NextResponse.json({
      bankrollCents: session.bankrollCents,
      rules: session.rules,
    });
  } catch (error) {
    console.error('Reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset game' },
      { status: 500 }
    );
  }
}
