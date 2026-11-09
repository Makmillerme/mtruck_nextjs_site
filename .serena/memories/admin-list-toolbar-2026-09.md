# Shared admin list toolbar

`components/admin/admin-list-toolbar.tsx` — products, sales, users, account-orders.
`components/admin/catalog/cms-panel-toolbar.tsx` — folders, fields panels.

## Layout (2026-11-09)
Below `md`: column — search full width on row 1; actions row with `justify-end` (right-thumb).
From `md+`: single row (`md:flex-row`) search `md:flex-1` + actions.

Icon-only below `sm` for filter / columns / create / archive labels (`hidden sm:inline` + aria-label).
`AdminArchiveLink` — shared outline archive nav (products/users/sales).
Skeleton: `LoadingAdminTable` mirrors the stack.