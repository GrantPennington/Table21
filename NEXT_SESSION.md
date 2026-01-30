# Next Session TODO - Table21

## Current State Summary

**Phases Complete:**
- Phase A ✅ - Scaffold + Types
- Phase B ✅ - Engine + Tests
- Phase C ✅ - Server Sessions + API
- Phase D ✅ - UI
- Phase E ✅ - Persistence

**V1 Features Complete:**
- Full blackjack gameplay (6-deck, S17, 3:2 BJ, splits, doubles)
- Responsive UI with card animations
- Keyboard shortcuts
- Home button + Restart button with confirmation
- Game over handling when bankroll hits $0
- Database persistence (Prisma + Neon Postgres)
- Player stats tracking (hands played, won, biggest win, total wagered)
- Hand history (last 50 hands per player)

## Next Up: Phase F - Leaderboards

### Features to Implement

1. **Leaderboard API**
   - `GET /api/leaderboard` - Get top players
   - Sort by: biggest win, total wagered, hands won, win rate

2. **Leaderboard UI**
   - New `/leaderboard` page
   - Table showing top 50 players
   - Tabs for different categories

3. **Player Display Name** (Optional)
   - Allow players to set a display name
   - Currently anonymous (shows truncated player ID)

### Database Schema Updates Needed

```prisma
model Player {
  // ... existing fields
  displayName String? // Optional display name for leaderboard
}
```

### Leaderboard Queries

```typescript
// Top by biggest win
prisma.player.findMany({
  orderBy: { biggestWin: 'desc' },
  take: 50,
});

// Top by win rate (need to calculate)
prisma.player.findMany({
  where: { handsPlayed: { gte: 10 } }, // Min hands to qualify
  orderBy: [
    // Custom sort by win rate
  ],
});
```

## Deployment Notes

For hosting on your website:
1. Set up Neon database
2. Configure environment variables
3. Deploy to Vercel/similar

Required env vars:
- `PLAYER_TOKEN_SECRET`
- `GAME_SESSION_SECRET`
- `DATABASE_URL`
