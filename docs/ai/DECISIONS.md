# Decisions

Architectural and technical decisions made in this project.
Each entry documents WHAT was decided and WHY.

## 2026-03-08: Frontend Watch Overview Sorting
- **Choice**: Move watch overview sorting for `recent_*` and `precise_*` entirely to Alpine.js in the client.
- **Reason**: The selected sort mode already lives in client `localStorage`, and the backend only needs to provide enriched card data for the frontend to reorder.
- **Considered**: Keeping server-side sorting behind `GET /watches?sort=...`.
- **Tradeoff**: The frontend must apply the persisted or default sort immediately after the HTMX grid swap to avoid showing arbitrary backend order.
