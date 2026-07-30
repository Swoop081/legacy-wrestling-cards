# LEGACY Wrestling Cards v0.3.2

Mobile single-screen match layout update.

- Match play is locked to the phone viewport with no page scrolling.
- Compact two-wrestler HUD remains visible at the top.
- Control, position, crowd and latest commentary remain visible.
- Card hand occupies the lower play area and scrolls only horizontally.
- Match Feed is collapsed behind an expandable panel.
- Core v0.3.0 card engine remains unchanged.

## v0.3.2 dead-hand protection
- The game revalidates the player's hand whenever the ring position changes.
- If no card can be played, one slot is automatically replaced with Brace and Block.
- Brace and Block is legal from every position and costs zero momentum, so a match cannot stall.
