# Catalog folder open/close ↔ URL sync (2026-10-13)

## Bug
UI looked like empty filter (accordion closed) while URL still had `?folder=…` → main showed 0 / emptySearch. Open=select / close=deselect only updated draft; listing waited for Apply.

Hide top-level (`showInFilter=false` hoist) made this easier to hit; empty query itself still returns all PUBLISHED (no scope-to-visible-roots).

## Fix
`useCatalogFilters.selectFolder` — immediate soft-nav via `buildCatalogHrefFromDraft` + `go()`.
`useLocalCatalogFilters.selectFolder` — immediate `onAppliedChange` (no URL).
Facets/ranges still draft until Apply. Sort remains independent URL param.

## Files
- `components/products/catalog-filters.tsx` — selectFolder immediate soft-nav / onAppliedChange
- `utils/catalog-query.ts` — `buildCatalogHrefFromDraft` always writes `folders: []` to clear `?folder=`

## Verify
Open accordion → URL `?folder=…`; clear/close root → `/products`; empty listing = all PUBLISHED (currently 0 in DB → Products.empty).


## Note
At fix time DB had 0 PUBLISHED (1 DRAFT Scania) — clean `/products` correctly shows Products.empty.
