# Catalog finder (homepage preview)

Date: 2026-09-10

Section title uses `SectionIntro` `align=start` (12-col, title in 5 cols left): «Оберіть категорію техніки». See `mem:section-intro-chessboard-2026-09`.

## Homepage plate (`CategoryFinderPanel`)
- White plate on pastel. **No** plate header. **No** availability/status (that belongs on `/products`).
- Fields: brand chips, year from/to, mileage from/to, CTA.
- CTA is `Button` default (`h-11`), same as `Input` — not `size=lg` (`h-12`).
- Year/mileage are `type=text` + `inputMode=numeric`, digits only. No spinner, no ArrowUp/ArrowDown stepping.
- Query: `category`, `make`, `yearFrom`, `yearTo`, `kmFrom`, `kmTo`.

## Cards
- Same live `VehicleCard` as UI Lab: price left, `Детальніше` right (`flex items-end justify-between`). Shadow + zoom on hover.
