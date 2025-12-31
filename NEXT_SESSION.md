# Next Session TODO - Blackjack Online

## Current State Summary

The blackjack game is fully functional with:
- ✅ Server-authoritative gameplay (Phase C API complete)
- ✅ Full UI with responsive layout (Phase D complete)
- ✅ Compact design with horizontal layout on large screens
- ✅ Card stacking for many cards
- ✅ Card dealing animations (casino-style)
- ✅ Result overlay with 1.5s delay and click-to-dismiss
- ✅ Keyboard shortcuts (H/S/D/P/R/Space)
- ✅ Bankroll bug fixed (no more negative balances)
- ✅ Settlement delay before overlay appears

## Features to Implement Next Session

### 1. Home Button
**Location**: `/play` page, probably in top bar next to bankroll
**Purpose**: Allow users to navigate back to home page (`/`)
**Implementation**:
- Add a home button/link in `TableLayout.tsx` top bar
- Use Next.js `Link` component
- Style to match existing UI (compact, clean)
- Icon or text button (e.g., "← Home" or just home icon)

### 2. Game Over / Bankroll Zero Handling
**Trigger**: When `bankrollCents === 0`
**Current Behavior**: Players can't bet but no clear indication
**Desired Behavior**:
- Detect when bankroll hits $0
- Show "Game Over" overlay/modal
- Offer "Start New Game" option
- Maybe show stats (hands won/lost, biggest win, etc.)

**Files to Modify**:
- `src/store/blackjackStore.ts` - Add game over state detection
- `src/components/blackjack/TableLayout.tsx` - Show game over UI
- Create new component: `src/components/blackjack/GameOverModal.tsx`

**Implementation Notes**:
```typescript
// In blackjackStore or TableLayout, detect:
if (bankrollCents === 0 && !roundState) {
  // Show game over modal
}
```

### 3. Restart/New Game Menu
**Trigger**: User clicks "Start New Game" from game over modal OR from a menu
**Functionality**: Reset bankroll to default, clear session, start fresh

**API Endpoint to Create**:
- `POST /api/game/reset` - Resets the game session
  - Clears current session
  - Creates new session with default bankroll
  - Returns new identity response

**Files to Create/Modify**:
- `src/app/api/game/reset/route.ts` - New API endpoint
- `src/lib/game/sessionStore.ts` - Add `resetGameSession()` function
- `src/store/blackjackStore.ts` - Add `resetGame()` action
- `src/components/blackjack/GameOverModal.tsx` - New component with restart button

**Implementation Approach**:
```typescript
// API route
export async function POST(request: NextRequest) {
  const playerId = await getOrCreatePlayerId();
  const session = await getOrCreateGameSession(playerId);

  // Reset session
  session.bankrollCents = DEFAULT_BANKROLL_CENTS;
  session.roundState = null;
  session.shoe = shuffleShoe(createShoe(session.rules.numDecks));
  updateGameSession(session);

  return NextResponse.json({
    bankrollCents: session.bankrollCents,
    rules: session.rules,
  });
}

// Store action
async resetGame() {
  set({ roundLoading: true });
  try {
    const response = await fetch('/api/game/reset', { method: 'POST' });
    const data = await response.json();
    set({
      bankrollCents: data.bankrollCents,
      roundState: null,
      currentBetCents: 0,
      roundLoading: false,
      error: null,
    });
  } catch (error) {
    set({ error: 'Failed to reset game', roundLoading: false });
  }
}
```

### 4. Optional: In-Game Menu
**Location**: Top bar, maybe a "☰" menu icon
**Options**:
- Home
- Restart Game
- Settings (future: sound, animations)
- Rules/Help

## File Structure Reference

```
src/
├── app/
│   ├── page.tsx                 # Home page (already exists)
│   ├── play/
│   │   └── page.tsx            # Main game page
│   └── api/
│       ├── identity/           # Player identity
│       ├── round/              # Game rounds (deal, action, state)
│       └── game/               # NEW: Game management (reset)
├── components/
│   └── blackjack/
│       ├── TableLayout.tsx     # Main layout (add home button here)
│       ├── GameOverModal.tsx   # NEW: Game over UI
│       ├── BetControls.tsx
│       ├── ActionBar.tsx
│       ├── ResultBanner.tsx    # Current overlay for results
│       ├── DealerHand.tsx
│       ├── PlayerHands.tsx
│       └── Card.tsx
├── store/
│   └── blackjackStore.ts       # Client state (add resetGame action)
└── lib/
    ├── game/
    │   ├── sessionStore.ts     # Session management
    │   └── roundController.ts
    └── engine/
        └── ...                 # Game logic (no changes needed)
```

## UI Design Notes

### Game Over Modal
- Full-screen overlay (like ResultBanner)
- Dark backdrop with blur
- Center card showing:
  - "Game Over" heading
  - Final bankroll: $0.00
  - Optional: Session stats
  - "Start New Game" button (primary)
  - "Return Home" button (secondary)
- Click outside to dismiss? Or require button click?

### Home Button
- Top left of screen (opposite bankroll)
- Icon: ← or 🏠 or just "Home"
- Small, unobtrusive
- Same styling as hotkey indicators

## Testing Checklist (Next Session)

- [ ] Home button navigates to `/` correctly
- [ ] Game over modal appears when bankroll hits $0
- [ ] "Start New Game" resets bankroll and session
- [ ] "Return Home" navigates to `/`
- [ ] After reset, can place bets and play normally
- [ ] Bankroll displays correctly after reset
- [ ] No duplicate sessions created

## Current Known Issues

- **Responsive Design**: 13" laptop and iPad-ish sizes have scrolling issues
  - Can tackle later with medium breakpoint adjustments
  - Large monitors work great, small mobile works great

## Session End Status

All features working correctly:
- Bankroll tracking fixed ✅
- Card animations working on every deal ✅
- Compact UI with no scrolling on large displays ✅
- Settlement overlay with delay ✅

Ready for next session!
