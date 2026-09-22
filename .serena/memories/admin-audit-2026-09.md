# Admin panel audit (2026-09-22)

## Style verdict
List CRUD (sales/products/users): shared AdminListToolbar + Sheet + table canon. CMS/archive use different chrome by design.

## Combobox search (P0 shipped)
- `SearchableEntityPicker`: `searchable` omitted → auto `options.length >= SHEET_COMBOBOX_SEARCH_MIN` (10).
- Clear row hidden while query is non-empty (so `CommandEmpty` can show).
- `CatalogMenuSelect` keeps explicit `searchable={false}`.
- Spec SELECT relies on auto (removed hardcoded `>= 10`).
- Sales «Оберіть авто» with 1 product: **no search field** (verified in browser).

## Dedup (P1 shipped)
- `lib/admin/sheet-url.ts` → `syncAdminSheetUrl` used by products/sales/users.
- Removed deprecated `CatalogNativeSelect` + `catalogSelectClassName`.

## Backlog (P2)
- Optimistic/cache-first admin writes
- Shared filter-sheet for products/sales
- CMS delete → AlertDialog (explicit ask only)
