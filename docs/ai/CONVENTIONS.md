# Conventions

Coding patterns, naming rules, and style agreements for this project.
Follow these without question. Do not deviate unless explicitly told.

## Frontend
- Keep watch overview cards as Handlebars template-rendered components; do not replace them with client-side rendering.
- Load the watch overview grid initially with an HTMX `GET /watches` request.
- Persist the selected watch overview sort mode in `localStorage` under `watchtracker-sortBy`.

## Configuration
- Read application URLs and ports from `.env`-backed config; do not hardcode a specific development port in code or docs.
- Prefer `APP_URL` in scripts and docs when a full browser URL is needed.

## Sorting
- Sort watch overview cards in the frontend from raw numeric or timestamp values, not from formatted display strings.
- Expose frontend sort keys for watch cards through template attributes such as `data-*` values.
