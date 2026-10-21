# Filter folder open/close vs selection (2026-10-06)

## User model
Open folder = select for filter; close = deselect.

## Actual (2026-10-13)
- Open: `selectFolder(slug)` → draft + **immediate** soft-nav URL (`?folder=`).
- Close mid-level: selection moves to parent slug (URL updates).
- Close root: `selectFolder("")` → clears `?folder=` immediately.
- Facets/ranges still draft until **Фільтрувати**.
- Sort stays independent URL param.

## Shared
`CatalogFilterTree` + `selectFolder` in catalog-filters (desktop/mobile) and admin via same draft pattern.