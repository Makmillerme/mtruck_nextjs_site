# Catalog finder (homepage preview)

Date: 2026-09-10

## Homepage plate (`CategoryFinderPanel`)
- White plate on pastel. **No** plate header (no «Уточніть підбір»).
- Fields: brand chips, year from/to, mileage from/to, CTA.
- **Do not** put availability/status on the homepage finder. That belongs on `/products` catalog filters.
- Query: `category`, `make`, `yearFrom`, `yearTo`, `kmFrom`, `kmTo`. Never `status` from this panel.

## Cards
- Same live `VehicleCard` as UI Lab: price left, `Детальніше` right (`flex items-end justify-between`).
