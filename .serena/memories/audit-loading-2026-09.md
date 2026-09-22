# Audit loading / render (2026-09-22)

## Problem
Uneven loading UX: Lab Skeleton canon unused; Suspense `fallback={null}` on catalog; missing `loading.tsx` on catalog/admin CMS/users/archive; admin layout blocked children on `fetchTaxonomyTree`; soft-nav only opacity; PDP loading showed card grid mismatch.

## Canon (Lab first)
Shared module: `components/global/loading-skeletons.tsx`
- `LoadingCardSkeleton` — Lab `#states` card (rounded-sm media h-40 + text + button)
- `LoadingCatalogGridCards` / `LoadingCatalogPage` — catalog grid + filter shell
- `LoadingProductPage` — PDP gallery + title + specs
- `LoadingAdminTable` — toolbar stub + row stubs

Wrappers: `LoadingContainer` → catalog cards; `LoadingTable` → admin table.
UI Lab `#states` imports `LoadingCardSkeleton` (single source of truth).

## Catalog / PDP (P0)
- `ProductsContainer`: Suspense fallback → `LoadingCatalogGridCards` (was `null`)
- `app/[locale]/products/loading.tsx` → `LoadingCatalogPage`
- Soft-nav: `catalog-pagination-client` `aria-busy` + skeleton-friendly pending (not blank)
- Home `CatalogFallback` uses grid skeletons
- PDP `loading.tsx` → `LoadingProductPage`; product page parallelizes favorite/review with product fetch where possible

## Admin (P1)
- `loading.tsx`: products, sales, catalog, users, archive → `LoadingAdminTable`
- `admin/layout.tsx`: static sidebar shell + Suspense for product roots (`SidebarFallback`); children not blocked on tree alone
- `fetchTaxonomyTree` wrapped in React `cache()` in `lib/catalog/taxonomy.ts` (dedupe layout + page)

## Verify
Browser: `/ui-lab#states`, `/admin/products`, `/admin/catalog`, `/products` — OK; diagnostics clean on touched files.

## Out of scope (still)
Full Empty redesign; Turbopack/prod bundle; error.tsx coverage.