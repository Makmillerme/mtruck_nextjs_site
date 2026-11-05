# Perf remediation Phase 3 (2026-11-05)

Admin `/admin/products` data path — server pagination + deferred filter chrome.

## fetchAdminProducts
- Now returns `{ items, total }` with Prisma `skip`/`take`.
- Args: `page`, `pageSize`, `q`, `subtreeIds` (sidebar root), `folders` / `scopedFacets` / `scopedRanges`.
- Where via `catalogQueryToWhere(..., { requirePublished: false, taxonomyNodeIds })`.
- Search: name + productCode (spec-label client haystack removed).

## catalogQueryToWhere
- New options: `requirePublished` (default true), `taxonomyNodeIds`.

## Page (`app/[locale]/admin/products/page.tsx`)
- Loads only `fetchTaxonomyTree` + `fetchRootCatalogAttributes` + paginated products.
- **No** `fetchPublicFilterSchema` / `fetchAdminFilterAvailabilityIndex` on every GET.
- Parses `q`/`page`/`pageSize` + catalog filter URL params.
- Passes `totalCount`, `listPage`, `listPageSize` to view.

## Lazy filter chrome
- `loadAdminProductsFilterChromeAction(rootId)` in `product-sheet-meta.ts`.
- AdminFilterSheet `onOpenChange` → fetch once; cleared when `listRootId` changes.

## View
- Soft-nav `router.replace` for search (debounced 300ms), page, pageSize, filter apply/clear.
- List = current server page; total from `totalCount`.
- Sheet edit still hydrates via existing `loadAdminProductSheetAction`.

## Verify
- `tsc --noEmit` clean.

## Next: Phase 4
Revalidate/write storms; sales soft-save; inquiries mark-read without layout bust; formation batch.