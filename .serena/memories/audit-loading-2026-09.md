# Audit loading / render (2026-09-22)

## UX rule
Skeleton **only** for cold waits on DB-backed content — **never** on static chrome (nav, toolbars, tabs, **catalog filter panel**). Soft-nav: keep prior UI + light opacity, no grey flash.

## Catalog
- No `products/loading.tsx`.
- Outer Suspense `fallback={null}` — do **not** paint filter as skeleton while schema loads.
- After filter shell is real: results Suspense may show `LoadingCatalogGridCards` only (product cards from DB).
- Soft-nav: `CatalogSoftNavProvider` + opacity on results.
- `LoadingCatalogPage` = results-only (no fake filter column).

## Admin
- No `admin/*/loading.tsx`.
- Sidebar Suspense fallback = real `<Sidebar productRoots={[]} />`.
- Cache-first optimistic writes: backlog (`mem:admin-perf-2026-09`).

## PDP / home
- PDP `loading.tsx` for hard product nav; home `CatalogBlock` Suspense for featured grid.
