# LEGACY Wrestling Cards v0.6.0

Mobile card-chain prototype featuring Cody Rhodes and Roman Reigns.

## v0.6.0
- Central played-card pile above the hand.
- Played attacks move to the pile and replacement cards append to the right of the hand.
- Matching reversals stack over the attack and transfer possession.
- Unreversed cards display SUCCESS and allow the attacking sequence to continue.
- Accuracy removed; an attack succeeds unless reversed.
- Action cards use yellow borders.
- Opening hand always contains two zero-cost cards, one grapple, one reversal and one random card.
- The opening player does not receive a discard phase on turn one.
- Later possessions retain the choose-any-number discard and redraw phase.
- Card stats reduced to Damage, Momentum and Cost at the bottom.

## v0.6.0 match-system changes
- Removed the manual discard/refresh phase.
- Wrestlers begin with five cards; hands can grow without a five-card cap.
- Every connected damaging move gives the defending wrestler one extra card.
- The attacker draws a replacement at the right end of the hand after playing a card.
- Playable cards are automatically sorted to the front while preserving relative order.
- Uses a real shuffled deck, discard pile, and reshuffle cycle with one copy of each card.
- Added Cody Rhodes signature/finisher cards: Disaster Kick, Cody Cutter, Cross Rhodes.
- Added Roman Reigns signature/finisher cards: Superman Punch, Spear, Guillotine Choke.
- Both player and CPU now attempt pins; zero health creates a 98% pin chance rather than automatic victory.
- Reversals use the same cost, damage, momentum, crowd, control, and draw-resolution path as normal cards.
- After three connected moves in one possession, the defender's bonus draw prioritises a matching reversal.
- Action cards are limited to one per possession.
- Removed obsolete Austin and Rock card definitions.
