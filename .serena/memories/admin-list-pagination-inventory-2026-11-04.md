# Admin list / table pagination inventory (2026-11-04)

## Status: IMPLEMENTED (client-side phase 1)
See also `session-2026-11-04-admin-table-pagination`.

## Approach
Full fetch on server → client filter → `useAdminTablePagination` slice. URL keys `page`/`pageSize` (25/50/75, default 25). Shared `AdminTablePagination` + UI Lab section `admin-table-pagination`.

## Wired
- AdminProductsView `/admin/products`
- AdminUsersView `/admin/users`
- AdminSalesView `/admin/sales`
- AdminInquiriesView `/admin/sales/inquiries` (also syncs `q`)
- AdminArchiveView `/admin/archive` (per-tab reset via resetKey=activeTab)

## Still out of scope
Prisma take/skip, CMS trees, public catalog sizes.

Shared AdminListToolbar on products/users/sales. ADMIN_LIST_SEARCH_KEY=q.