# Filter apply button (2026-09-18)

Deferred filter apply instead of live URL on every click.

## Behaviour
- Draft in `useCatalogFilters`: folders, scopedFacets, scopedRanges.
- Tree clicks only mutate draft; `isDirty` compares serialize(draft) vs URL.
- Sticky footer: **Фільтрувати** (default when dirty, disabled when clean) + **Скинути**.
- Apply: `buildCatalogHrefFromDraft` → one `router.replace`.
- Sync draft when `searchParams` change (back/forward).
- Search/sort/pagination still immediate.
- Availability still from applied URL; client `pruneDependentFacetValues` on draft.

## Follow-up (same day)
- Removed catalog page h1 from ProductsContainer.
- Filter sidebar: self-start, no h-full — height follows content; max-h + sticky kept.

## Files
- `utils/catalog-query.ts` — `buildCatalogHrefFromDraft`, `serializeCatalogFilterDraft`
- `components/products/catalog-filters.tsx` — draft + footer
- `components/products/catalog-view.tsx` — sidebar/sheet layout for sticky footer
- `components/dev/ui-lab-catalog-filter.tsx` — same pattern
- i18n `Products.filterApply` (uk/en/de)
