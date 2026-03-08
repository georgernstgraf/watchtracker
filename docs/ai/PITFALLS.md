# Pitfalls

Things that do not work, subtle bugs, and non-obvious constraints.
Read this file carefully before making changes in affected areas.

- Do not sort watch overview cards by the rendered date label; use a raw timestamp for `recent_*` sorting.
- Do not sort watch overview cards by parsing the displayed precision label in the browser; provide a raw absolute drift value.
- When the watch grid is loaded by HTMX, apply the persisted or default Alpine sort immediately after the swap so the backend's arbitrary order never flashes as final state.
- `deno task test` can fail with unrelated 404s if the `.env` `APP_PORT` is already occupied; the spawned dev server exits with `EADDRINUSE`, and the test suite may hit the wrong listener.
- `deno task test` may still pass while logging `EADDRINUSE` if another server is already listening on the configured `.env` `APP_PORT`.
