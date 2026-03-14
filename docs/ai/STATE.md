# Project State

Current status as of 2026-03-14.

## Current Focus
Polish the watch overview and watch-details UI issues opened from prompt imports.

## Completed (this cycle)
- [x] Replaced the four watch overview sort buttons with two Alpine-driven toggle buttons for `Recent` and `Precise`.
- [x] Kept the existing `watchtracker-sortBy` persistence and card sorting behavior while deriving the displayed arrow from the active sort state.
- [x] Verified the issue `#129` implementation with `deno task check`, `deno task lint`, and `deno task test`.

## Pending
- [ ] Issue `#130`: Update watch rate accuracy colors and arrows to match drift direction.
- [ ] Issue `#131`: Widen watch-details buttons and improve overview sort button distribution on larger displays.
- [ ] Optionally make `scripts/test.sh` detect and handle an already running server on the configured `.env` `APP_PORT` more explicitly.

## Blockers
- None

## Next Session Suggestion
Start with issue `#130`, then issue `#131`, and keep the existing Alpine/HTMX watch overview structure intact.
