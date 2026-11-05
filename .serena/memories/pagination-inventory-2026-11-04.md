# Pagination inventory (2026-11-04)

## Present in repo
- **Canonical UI:** `components/products/catalog-pagination.tsx` — prev/next Button outline + `pageOf` + DropdownMenu pageSize. Not shadcn Pagination primitive.
- **URL wrapper:** `components/products/catalog-pagination-client.tsx` — soft-nav `router.replace` via `buildCatalogHref`; pageSize change resets to page 1.
- **Wiring:** `ProductsContainer` → `CatalogResultsSwitch` (grid/list + pagination slot) → `/products` via `parseCatalogQuery`.
- **Data:** `utils/actions.ts` `fetchAllProducts` skip/take; sizes in `utils/catalog-query.ts`.

## Page sizes (not 10/25/50)
- Narrow (&lt;xl): **10 / 20 / 30**
- Wide (xl+ 3-col): **9 / 18 / 36**
- Default 10; legacy URL 25→20, 40→36.

## Missing
- No `components/ui/pagination.tsx` (shadcn registry has `@shadcn/pagination` but not installed).
- No admin table pagination / pageSize 10-25-50.

## UI Lab
- Section `catalog-pagination` — demo in `ui-lab-catalog-filter.tsx` (`UiLabCatalogPaginationDemo`). Hints in catalog/ui-lab still say stale 10/25/40.
- Section `table` — static Table sample, no pagination.

## i18n (`Products` ns)
- `pageOf`, `pageSize`, `prevPage`, `nextPage` in `messages/{uk,en,de}.json`.