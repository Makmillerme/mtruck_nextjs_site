# Admin gap fixes (2026-10-06)

Follow-up to `mem:session-2026-10-06-admin-gap-audit`. Sales mini-CRM UI deliberately NOT done (backlog «Міні-CRM Продажі (A+1)» stays Відкладено).

## 1. Sales REQUEST safety
- `updateAdminOrderAction` (`utils/actions.ts`) no longer writes `kind: 'CATALOG'`; kind/status/origin/note/taxonomyNodeId preserved on edit.
- `fetchAdminOrders` includes `taxonomyNode { id, name }`; sales page maps `folderName`; table «Авто» cell: product link → productName → folderName → vehicleUnset. Search haystack includes folderName.
- Create still CATALOG/NEW/ADMIN (expected until CRM).

## 2. Admin soft-nav
- `app/[locale]/admin/layout.tsx`: `SoftNavProvider` around sidebar + `SoftNavPending className="min-w-0 w-full"` around children (provider has no DOM — grid intact).
- `Sidebar.tsx`: `navigate()` — plain left click → `preventDefault` + `softNav.startTransition(() => router.push(href))` (next-intl router); modifier clicks fall through.

## 3. List URL state
- `lib/admin/list-url.ts`: `syncAdminListUrl(ownedKeys, next, isOwned?)` — replaceState, deletes owned keys only; sheet keys (create/edit/node/userId/root) untouched. `ADMIN_LIST_SEARCH_KEY = "q"`.
- `syncAdminSheetUrl` already preserved non-transient keys, so filters survive sheet open/close.
- Sales: `SALES_FILTER_URL_KEYS`, `salesFilterFromParams`, `salesFilterToParams` in `sales-filter-fields.tsx`; view inits from `useSearchParams` (lazy useState), effect syncs.
- Products: `utils/catalog-query.ts` + `isCatalogFilterParam`, `catalogDraftToParams` (folder + f.{slug}.key / Min / Max); read via `parseCatalogQuery`. Root-change reset skips first run via `filterRootRef` so URL filter survives mount.
- Users: `role` + `q`.

## 4. Users role filter
- `admin-users-view.tsx`: `AdminFilterSheet` (default footer) + controlled `SearchableEntityPicker` role (all/USER/MANAGER, ADMIN only if canManageRoles). i18n `Admin.filterRoleAll` uk/en/de.

## Verified
- `tsc --noEmit` clean.
- Browser: `/admin/users?role=ADMIN&q=a` → search filled, 1 user; `/admin/sales?paid=paid` → filter badge 1; `/admin/products?root=..&q=scania` → search filled; sidebar click sets `aria-busy` during transition.

## Commits
feacf73 (REQUEST), 1c430ef (soft-nav), 51211c3 (sales URL), 76c2351 (products URL), 77ff8da (users filter).
