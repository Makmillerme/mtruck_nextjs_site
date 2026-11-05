# Perf remediation Phase 2 (2026-11-05)

Storefront payload + filter cold path.

## A — Slim product list select
- `utils/product-list.ts`: `buildProductListSelect(specKeys)` — specs filtered by attribute.key; gallery `take: 2`; `selectedOptions` for MULTI_SELECT.
- `CARD_LIST_ALWAYS_KEYS`: year, location, make.
- `lib/catalog/card-preview-keys.ts`: `fetchAllCardPreviewSpecKeys()` (unstable_cache, catalog tags) = union of all card-preview slot+subtitle keys + always keys.
- `utils/actions.ts`: `productListSelectCached()` used by featured, catalog page, related, favorites.
- Card-preview save (`card-preview-actions`): `revalidatePublicCatalog()` so keys/list caches bust.

## B — Compact FilterAvailabilityIndex
- Type now `{ paths: string[][]; rows: { pathIdx; specs }[] }`.
- `compactAvailabilityIndex` / `availabilityPathSlugs` / `expandAvailabilityRow`.
- `narrow-facets` uses pathIdx via index.paths.
- `productMatchesCatalogDraft` still takes expanded `{ pathSlugs, specs }` (admin row match unchanged).
- Cache keys bumped to `*-v2`. UI Lab demos updated.

## C — Public filter cold bounds
- `loadNumericFacetBoundsIndex()`: one findMany of NUMBER/YEAR facet specs; in-memory min/max per key×node.
- `mapFilterNodes` uses boundsFromIndex instead of per-facet `productSpec.aggregate` N+1.
- Schema cache key `public-filter-schema-v2`.

## Verify
- `tsc --noEmit` clean (non-incremental).

## Next: Phase 3
Admin products server pagination; defer filter schema/availability on products GET.