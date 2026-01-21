# WatchTracker Project Code Review

## Executive Summary

WatchTracker is a Deno-based web application using Hono, Prisma, and HTMX. The project follows a clean layered architecture and successfully integrates server-side rendering with dynamic frontend interactions via HTMX.

## Strengths

- **Architecture:** The Repo -> Service -> Router/Route layering is strictly followed, making the business logic easy to test and maintain.
- **Frontend Strategy:** The choice of HTMX over a heavy SPA framework keeps the codebase simple and the application responsive.
- **Deno Adoption:** Modern use of Deno with built-in task management and TypeScript support.
- **Data Safety:** Ownership verification (checking if a watch belongs to a user before operations) is consistently applied.

## Recent Fixes (Issues #68, #54, #69, #70)

- **Routing & Static Files:** Fixed critical bugs in middleware path matching and static asset serving.
- **Session Management:** Fixed a Memcached TTL bug that caused sessions to expire prematurely.
- **UX Improvements:** Optimized the deviation input field with a placeholder-based approach, avoiding "0" prepending issues.
- **Data Enrichment:** Fixed "NaN" date display bugs by ensuring consistent enrichment of database records with human-readable timestamps (`createdAt16`) before rendering.
- **Watch Selector:** Restored functionality by ensuring the correct watch data is fetched and enriched during selector-triggered requests.

## Areas for Improvement

### 1. Code Cleanup

- **Classes Old:** The `classes_old/` directory appears to be legacy code from a previous iteration. If not in use, it should be removed to reduce cognitive load.
- **Naming Consistency:** The distinction between `getUserWatchWithMeasurements` (raw) and `getWatchForDisplay` (enriched) is subtle and led to the NaN bug. Consider consolidating these into a single service method with optional parameters.

### 2. Infrastructure & Configuration

- **Watch Task:** The `deno task watch` was recently improved to monitor `views/`. Consider also adding `static/` to ensure frontend assets trigger reloads if necessary.
- **Prisma Output:** The Prisma client is generated to a custom path (`prisma/client/`). This works well but requires manual re-generation on schema changes (now simplified by `deno task p_g`).

### 3. Error Handling

- **Consistency:** Routes currently return `c.text(error.message, status)`. For a better UX, consider a centralized error handler that renders an error template for non-HTMX requests and a small partial for HTMX requests.

### 4. Security

- **Middleware:** Ownership checks are currently manual in each route. This is safe but could be abstracted into a Hono middleware that validates resource IDs against the session user automatically.

## Recommendations

1. **Consolidate Service Methods:** Merge `getWatchForDisplay` logic directly into the repository or service layers so that records are always returned with necessary UI metadata.
2. **Remove `classes_old`:** Delete this directory if confirmed obsolete.
3. **Enhance `deno.json`:** Add more exhaustive linting rules and potentially a `test` task once unit tests are implemented.

---
*Review conducted on 2026-01-22*
