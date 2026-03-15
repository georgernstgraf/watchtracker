# Conventions

Coding patterns, naming rules, and style agreements for this project.
Follow these without question. Do not deviate unless explicitly told.

## Frontend
- Keep watch overview cards as Handlebars template-rendered components; do not replace them with client-side rendering.
- Load the watch overview grid initially with an HTMX `GET /watches` request.
- Persist the selected watch overview sort mode in `localStorage` under `watchtracker-sortBy`.
- In measurement rows, display the signed deviation value directly, but derive color and indicator glyphs from `driftDisplay`; start measurements must stay neutral.
- Keep drift arrows on watch overview cards without any color emphasis; reserve drift colors for watch details and measurement rows.
- Use wider responsive action buttons in watch-details edit mode and evenly distributed sort buttons on the overview page without changing the underlying Alpine or HTMX behavior.
- Give important one-off template elements clear unique HTML IDs, and rename vague legacy IDs when touched; update any HTMX triggers or selectors that depend on them.

## Configuration
- Read application URLs and ports from `.env`-backed config; do not hardcode a specific development port in code or docs.
- Prefer `APP_URL` in scripts and docs when a full browser URL is needed.

## Sorting
- Sort watch overview cards in the frontend from raw numeric or timestamp values, not from formatted display strings.
- Expose frontend sort keys for watch cards through template attributes such as `data-*` values.
- Keep the watch overview sort UI as two Alpine-controlled toggle buttons, one for `Recent` and one for `Precise`, with the active arrow derived from the current `sortBy` state.
