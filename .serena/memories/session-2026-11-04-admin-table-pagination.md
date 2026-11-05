## Admin table pagination (UI Lab → prod) — 2026-11-04

### Canon
- UI Lab: `/ui-lab` section `admin-table-pagination` → `components/dev/ui-lab-admin-pagination.tsx`
- Shared UI: `components/admin/admin-table-pagination.tsx` (Button outline prev/next + DropdownMenu pageSize; not shadcn Pagination)
- Helpers: `lib/admin/list-pagination.ts` — `ADMIN_PAGE_SIZES=[25,50,75]`, default 25; URL keys `page`/`pageSize`; parse/clamp/slice; omit defaults from URL
- Hook: `lib/admin/use-admin-table-pagination.ts` — client slice after filters; resets page→1 when `resetKey` changes or pageSize changes
- Re-export keys from `lib/admin/list-url.ts` (`ADMIN_LIST_PAGINATION_KEYS`)
- i18n Admin: `pageOf`, `pageSize`, `prevPage`, `nextPage` (uk/en/de)

### Wired views (URL page+pageSize, slice after filter)
1. `admin-products-view.tsx` — resetKey = search+appliedFilter
2. `admin-users-view.tsx` — resetKey = search+roleFilter
3. `admin-sales-view.tsx` — resetKey = search+appliedFilter
4. `admin-inquiries-view.tsx` — also syncs `q`; resetKey = search
5. `admin-archive-view.tsx` — one hook on active-tab items; resetKey = activeTab; sync `tab`+pagination; bar per active TabsContent

### Behavior
- Bar hidden when filtered/tab list length === 0
- Filter/search/tab/pageSize → page 1
- Phase 1 client-only (no Prisma take/skip)

### Out of scope
- Server Prisma pagination, catalog page sizes, CMS trees