# Project State

Current status as of 2026-03-14.

## Current Focus
Polish the remaining watch-details UI issue opened from prompt imports.

## Completed (this cycle)
- [x] Replaced the four watch overview sort buttons with two Alpine-driven toggle buttons for `Recent` and `Precise`.
- [x] Kept the existing `watchtracker-sortBy` persistence and card sorting behavior while deriving the displayed arrow from the active sort state.
- [x] Verified the issue `#129` implementation with `deno task check`, `deno task lint`, and `deno task test`.
- [x] Updated issue `#130` so watch overview and watch-details precision summaries use drift-direction colors and arrows.
- [x] Updated measurement rows so signed deviation values remain visible while non-start color and glyph states come from drift versus the previous measurement.
- [x] Added a neutral zero-drift state for measurement rows using warning color and the `≡` symbol.
- [x] Verified the issue `#130` implementation with `deno task check`, `deno task lint`, and `deno task test`.

## Pending
- [ ] Issue `#131`: Widen watch-details buttons and improve overview sort button distribution on larger displays.
- [ ] Optionally make `scripts/test.sh` detect and handle an already running server on the configured `.env` `APP_PORT` more explicitly.

## Blockers
- None

## Next Session Suggestion
Start with issue `#131`, and keep the existing Alpine/HTMX watch overview structure intact.
