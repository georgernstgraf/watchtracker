# Domain Knowledge

Business rules and domain relationships not obvious from code.

## Entities
- watch overview card: Displays a watch with derived summary fields such as overall precision, measured days, and last used date.

## Rules
- `Recent` sorting is based on the last measurement date shown as `lastUsedDate` on the watch card.
- `Precise` sorting is based on the absolute value of the watch card's overall drift or precision.
- Individual measurement rows show the signed deviation seconds as recorded, but their color and indicator reflect drift versus the previous measurement: negative drift is red with `↓`, zero drift is warning-colored with `≡`, positive drift is green, and start measurements stay neutral.
- If a watch's latest measurement is a `start` record older than 31 days, treat it as stale and delete it when that watch is loaded for display.
