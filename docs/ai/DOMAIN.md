# Domain Knowledge

Business rules and domain relationships not obvious from code.

## Entities
- watch overview card: Displays a watch with derived summary fields such as overall precision, measured days, and last used date.

## Rules
- `Recent` sorting is based on the last measurement date shown as `lastUsedDate` on the watch card.
- `Precise` sorting is based on the absolute value of the watch card's overall drift or precision.
