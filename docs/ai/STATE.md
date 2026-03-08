# Project State

Current status as of 2026-03-08.

## Current Focus
Move watch overview sorting from the backend to Alpine.js while keeping the initial card load on `GET /watches` via HTMX.

## Completed (this cycle)
- [x] Analyzed the current watch overview flow across routes, services, templates, and tests.
- [x] Confirmed that the initial watch grid should continue loading through HTMX.
- [x] Confirmed that the watch cards remain server-rendered template components.
- [x] Removed backend watch overview sorting and kept backend card enrichment.
- [x] Added raw watch-card sort keys for last-used timestamp and absolute drift.
- [x] Switched watch overview sorting to Alpine.js after the HTMX grid swap and on persisted sort changes.
- [x] Updated watch route tests to match the removed backend `?sort=` contract.
- [x] Removed hardcoded `8000` references and switched docs/scripts/config guidance to `.env`-driven `APP_PORT` and `APP_URL`.
- [x] Added an `APP_URL`-based fallback for `APP_PORT` parsing in `lib/config.ts`.

## Pending
- [ ] Optionally make `scripts/test.sh` detect and handle an already running server on the configured `.env` `APP_PORT` more explicitly.

## Blockers
- None

## Next Session Suggestion
Optionally harden `scripts/test.sh` so it does not silently rely on an already running server when `APP_PORT` is occupied.
