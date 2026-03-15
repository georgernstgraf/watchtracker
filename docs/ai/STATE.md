# Project State

Current status as of 2026-03-15.

## Current Focus
Wrap up imported prompt issues and small maintainability improvements.

## Completed (this cycle)
- [x] Replaced the four watch overview sort buttons with two Alpine-driven toggle buttons for `Recent` and `Precise`.
- [x] Kept the existing `watchtracker-sortBy` persistence and card sorting behavior while deriving the displayed arrow from the active sort state.
- [x] Verified the issue `#129` implementation with `deno task check`, `deno task lint`, and `deno task test`.
- [x] Updated issue `#130` so watch overview and watch-details precision summaries use drift-direction colors and arrows.
- [x] Updated measurement rows so signed deviation values remain visible while non-start color and glyph states come from drift versus the previous measurement.
- [x] Added a neutral zero-drift state for measurement rows using warning color and the `≡` symbol.
- [x] Verified the issue `#130` implementation with `deno task check`, `deno task lint`, and `deno task test`.
- [x] Updated issue `#131` so watch-details edit actions are wider and the overview sort buttons distribute more evenly on larger screens.
- [x] Kept drift arrows on watch overview cards but removed their color emphasis.
- [x] Restored the positive-drift upward arrow in measurement rows and fixed zero-drift ordering so `+0.0` still renders as `≡`.
- [x] Verified the issue `#131` implementation with `deno task check`, `deno task lint`, and `deno task test`.
- [x] Updated issue `#132` by assigning clearer unique IDs to important one-off UI elements across watch details, overview, measurements, and navigation templates.
- [x] Renamed the measurement create form ID and updated the matching `htmx.trigger(...)` call so behavior stayed intact.
- [x] Verified the issue `#132` implementation with `deno task check`, `deno task lint`, and `deno task test`.
- [x] Updated issue `#125` so watch details lazily delete stale latest `start` measurements older than 31 days instead of relying on startup cleanup.
- [x] Added a regression test that preserves recent latest `start` measurements during watch-details loading.
- [x] Verified the issue `#125` implementation with `deno task check`, `deno task lint`, and `deno task test`.

## Pending
- [ ] Optionally make `scripts/test.sh` detect and handle an already running server on the configured `.env` `APP_PORT` more explicitly.

## Blockers
- None

## Next Session Suggestion
Review the remaining open GitHub issues for already-shipped work or handle the test script port-detection follow-up.
