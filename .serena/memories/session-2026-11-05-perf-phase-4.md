# Perf Phase 4 — revalidate storms / soft-save / formation batch (2026-11-05)

## Done

### Inquiries
- `markCallbackInquiriesReadAction` / `updateCallbackInquiryStatusAction`: removed `revalidatePath('/', 'layout')` (kept `/admin/sales/inquiries`).
- `admin-inquiries-view`: no `router.refresh()` after mark-read; local `listItems` clears unread badges. Navbar badge already zeros on inquiries page.

### Sales soft-save
- `lib/admin/order-row.ts`: `AdminOrderRowDTO`, `adminOrderListInclude`, `mapAdminOrderRow`.
- `ActionState.order` added.
- `createAdminOrderAction` / `updateAdminOrderAction`: return `{ ok, message, order }` + revalidate sales/account paths — **no** `redirectLocalized`.
- `fetchAdminOrders` returns mapped DTOs.
- `admin-sales-view`: `listItems` + `onOrderSaved` (patch list, close sheet, `syncAdminSheetUrl({})`).

### Revalidate narrowing
- `revalidateCatalog` (taxonomy-actions): dropped `/admin` and `/admin/products/create`.
- `revalidatePublicCatalog({ scope: 'full' | 'product' })`: product scope skips `root` / filterSchema / homeFinder / `/` path; still busts products + availability + `/products` (+ PDP id).
- Product CRUD/archive/restore/image calls use `scope: 'product'`.
- `saveProductPageLayoutAction`: no layout-wide `/` revalidate; only `/admin/ui` + `/admin/catalog`.

### Formation batch
- `applyFormationTemplatesToSpecs` pure helper.
- `regenerateFormationInFolderSubtree`: caches templates per `taxonomyNodeId` (no N× `fetchDisplayGroupsForNode`).

## Verify
- `tsc --noEmit` clean.

## Next (Phase 5)
- Chrome / PDP / account / client bundle weight (see `mem:plan-perf-audit-remediation-2026-11-05`, `mem:perf-audit-full-report-2026-11-05`).
