# Audit loading / render (2026-09-22)

## Canon (Lab first)
Shared: `components/global/loading-skeletons.tsx` (`LoadingCardSkeleton`, `LoadingCatalogGridCards`, `LoadingCatalogPage`, `LoadingProductPage`, `LoadingAdminTable`). UI Lab `#states` imports the same card.

## UX rule (refined 2026-09-22)
Skeleton **only** for cold waits on DB-backed content — **not** on soft-nav / cached hits (no grey flash).

### Catalog soft-nav
- **Removed** `app/[locale]/products/loading.tsx` — route `loading.tsx` flashed on every searchParams update.
- Nested Suspense in `ProductsContainer`: outer `LoadingCatalogPage` for cold body; results Suspense keeps prior UI under `startTransition`.
- Shared `CatalogSoftNavProvider` (`catalog-soft-nav.tsx`): one transition for search/sort/filters/pagination; `CatalogSoftNavResults` dims with `opacity-60` + `aria-busy` while pending — **keeps content**, no skeleton grid.

### Still skeleton (cold / first paint)
- Nested Suspense cold load on `/products`
- Home `CatalogBlock` Suspense fallback (DB featured grid)
- PDP `loading.tsx` (`LoadingProductPage`)
- Admin route `loading.tsx` (`LoadingAdminTable`) on segment navigations

### Admin
Layout Suspense for product roots; `fetchTaxonomyTree` via React `cache()`.

## Out of scope
Empty redesign; Turbopack/prod bundle; error.tsx coverage.