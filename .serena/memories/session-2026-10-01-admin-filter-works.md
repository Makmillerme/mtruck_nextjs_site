# Admin catalog filter actually filters (2026-10-01)

## Bugs fixed
1. **Nested leaf + facets blocked**: selecting leaf set `openSlug` to leaf → parent collapsed with `pointer-events-none` → leaf/facets unusable. Fix: ancestors stay open while descendant selected/open (`descendantActive`).
2. **Collapsed panels leaked clicks**: add `overflow-hidden` + `pointer-events-none` when closed.
3. **Selected leaf collapsed**: keep leaf open while selected; re-click deselects (`selectFolder("")`).

## Verified in browser
`/admin/products?root=…`: Вантажні → Контейнеровози → Марка/Рік → Фільтрувати.
- Scania + folder → count 1, badge
- Рік від 2010 → count 0, Scania hidden, badge 2

## Files
`catalog-filter-tree.tsx`, `catalog-filters.tsx` (`selectFolder("")` → empty draft)
