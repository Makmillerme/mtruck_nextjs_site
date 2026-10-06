# Admin Filter = catalog Sheet (2026-09-29)

## Behavior
`/admin/products` «Фільтр» Sheet — той самий UI що мобільний каталог (`CatalogFilterFields` + tree/hairlines), не статуси.

## Data
- Page loads `fetchPublicFilterSchema()` + `fetchAdminFilterAvailabilityIndex()` (all non-archived; separate cache key).
- Product specs include `optionSlug` (`fetchAdminProducts` option.slug).

## Local draft
- `LocalCatalogFilterProvider` / `useLocalCatalogFilters` in `catalog-filters.tsx` — no URL sync.
- Apply → `appliedFilter` state + close sheet; clear → empty draft.
- Table filter: `productMatchesCatalogDraft(adminItemToFilterRow(...), appliedFilter)` after search.
- `AdminFilterSheet` `hideFooter` + render-prop `{ close }` so CatalogFilterFields owns Apply/Очистити.

## Files
- `lib/catalog/filter-availability.ts`, `narrow-facets.ts` (`productMatchesCatalogDraft`)
- `components/products/catalog-filters.tsx`
- `components/admin/admin-list-toolbar.tsx`, `admin-products-view.tsx`
- `app/[locale]/admin/products/page.tsx`, `utils/actions.ts`
