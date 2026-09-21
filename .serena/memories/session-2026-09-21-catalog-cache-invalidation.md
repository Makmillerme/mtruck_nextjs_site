# Catalog cache invalidation (2026-09-21)

## Problem
Admin create/update/archive/delete of products (and taxonomy edits) did not show on public `/products` until hard refresh or ~60s TTL. Cause: `unstable_cache({ revalidate: 60 })` without tags; `revalidatePath` alone does not bust Data Cache. `createProductAction` / `updateProductAction` also had **no** revalidation at all before redirect.

## Fix (Next.js 16.3)
- `lib/catalog/cache-tags.ts` — tag constants + TTL only (safe for modules shared with client).
- `lib/catalog/cache.ts` — `revalidatePublicCatalog()` via `updateTag('catalog')` + `revalidatePath`; **import only from Server Actions**.
- Tagged caches:
  - `utils/actions.ts` → `fetchAllProducts`
  - `lib/catalog/public-filter.ts` → `fetchPublicFilterSchema` (imports **cache-tags**, not cache)
  - `lib/catalog/filter-availability.ts` → `fetchFilterAvailabilityIndex`
- Call sites: create/update/archive/restore/delete product, updateProductImage, `taxonomy-actions` `revalidateCatalog()`.

## Bugfix (build)
Putting `revalidatePath` in a module imported by `public-filter.ts` broke the client bundle (`catalog-filters` → `public-filter`). Split tags vs revalidation.

## Verify
1. Add product in admin → `/products` shows it without Ctrl+Shift+R.
2. Archive/delete → disappears without waiting 60s.
3. Dev/build: no "revalidatePath … Pages Router" / client import error.
