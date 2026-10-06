# Admin gap audit (2026-10-06)

Read-only audit of `/admin/*`. Plan mode rejected by user; no code changes.

## Mature (done)
- **CMS** `/admin/catalog`: folders/fields/display groups/options; ConfirmDelete; CmsPanelToolbar search; option LuPen edit; sheet cascade `variant=tree` aligned like CMS menu.
- **Products** `/admin/products`: sheet create/edit, folder picker tree, columns sheet, status/availability filters (no company/featured), optimistic archive, roots in Sidebar.
- **Users** `/admin/users`: codes, roles (ADMIN/MANAGER), create/edit, link to sales create with userId.
- **Archive**: sales/products/users tabs, restore + hard delete (ADMIN), optimistic remove.
- Shared: AdminListToolbar, AdminFilterSheet, SearchableEntityPicker threshold≥10, SoftNav on CMS/archive tabs.

## Gaps (priority)
### P0 — Sales mini-CRM + REQUEST safety
- Prisma: `Order.status` NEW|IN_PROGRESS|CLOSED, `kind`, `origin`, `note`, `taxonomyNodeId` exist.
- UI table «Статус» = `isPaid` only; form has no status/kind/origin/note/folder.
- `adminOrderSchema` omits CRM fields; create hardcodes CATALOG/NEW; **updateAdminOrderAction writes `kind: 'CATALOG'`** — editing REQUEST corrupts it.
- Sales page mapping: no taxonomy folder label for REQUEST rows.
- Backlog: `ideas.md` «Міні-CRM Продажі (A+1)» — Відкладено.

### P1 — Polish lists
- Filter state not in URL (products/sales client-only).
- Users: search only, no AdminFilterSheet (role etc.).
- Soft-nav not on sidebar hops between admin sections.

### P2 — Optional / backlog
- Optimistic sheet create/update CRUD (lists OK).
- Archive list-toolbar redesign.
- Callback/partnership inquiry persistence (not admin-only).
- Public REQUEST order flow already in account; admin CRM should surface it.

## Not admin gaps
Marketing pages, Stripe (cancelled), Telegram (out of repo), Google OAuth prod callback.
