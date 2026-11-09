# Catalog/admin pagination one row (2026-11-09)

User: pagination on phone was two lines (`< 1/1 >` then `На сторінці [10]`). Want single row on all screens.

Fix: remove `flex-wrap` → `flex-nowrap w-full justify-between` with tighter mobile gaps; hide pageSize label below 380px (aria-label remains on trigger).

Files:
- `components/products/catalog-pagination.tsx`
- `components/admin/admin-table-pagination.tsx` (same canon)

UI Lab demos reuse these components — no separate Lab edit.