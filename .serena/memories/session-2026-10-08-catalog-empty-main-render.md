# Catalog empty-main / collapse render fix (2026-10-08)

## Bug
Cold `/products` navigation: main emptied and page compressed (footer jump), then content popped in.

## Root cause
`ProductsContainer` wrapped `ProductsCatalogBody` in `<Suspense fallback={null}>`. While schema/availability streamed, Suspense painted nothing inside `.page-content` → collapsed main.

## Fix (do not reintroduce null outer Suspense)
1. **Await** `ProductsCatalogBody` in `ProductsContainer` (no outer Suspense). Soft-nav `startTransition` keeps prior full CatalogView; avoids remounting chrome into a shell on every filter replace.
2. **`app/[locale]/products/loading.tsx`** → `LoadingCatalogPage` for cold route wait.
3. **`LoadingCatalogShell` / `LoadingCatalogPage`** in `components/global/loading-skeletons.tsx` — same grid footprint as `CatalogView`.
4. Inner Suspense around `CatalogResults` keeps `LoadingCatalogGridCards` only for the results grid.

## Verify
- `tsc --noEmit` clean.
- Browser: `/products` shows filter + results (no empty main).
- Temporary 2.5s delay in body confirmed ~2.7–3.2s server time; do not leave delay in code.

## Related
- Soft-nav: `components/soft-nav/soft-nav.tsx`, dim via `SoftNavPending` / `CatalogSoftNavResults`.
- Do **not** wrap `ProductsCatalogBody` in Suspense with a shell fallback unless SoftNavProvider is lifted outside — otherwise soft-nav filter would flash the shell.

## Uncommitted files
- `components/products/ProductsContainer.tsx`
- `components/global/loading-skeletons.tsx`
- `app/[locale]/products/loading.tsx`