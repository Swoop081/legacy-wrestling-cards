LEGACY Pro Wrestling 1.0 — Throwdown Begin Fix

Root cause:
The current consolidated show-intro renderer called cleanBroadcastText(), but that helper was not available in its runtime scope. Week 1 Thursday Throwdown therefore threw a ReferenceError before rendering, making the Begin button appear unresponsive.

Fix:
- Replaced the unavailable helper with a local safe text normaliser.
- Restored one canonical Career Begin route through gauntletLiveBeginDay().
- Ensured a valid show-plan item exists before opening televised days.
- Kept click, keyboard and touch activation available.
- Added interaction-layer CSS for the visible Begin control.

Verification:
- Loaded data.js, imageManager.js, game.js and career-consolidated.js in Chromium.
- Created a Week 1 Thursday save state.
- Rendered the Career calendar.
- Confirmed the button exists and is enabled.
- Confirmed direct Career day routing opens the Throwdown show intro.
- Confirmed programmatic click opens the Throwdown show intro.
- Confirmed touchend opens the Throwdown show intro.
- JavaScript syntax checks passed.
