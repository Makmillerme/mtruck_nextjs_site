# Admin perf: soft-save + slim list + smart writes (2026-10-08)

## Shipped
1. **Soft-save** — `createProductAction` / `updateProductAction` return `{ ok, message, product }` (no redirect). `FormContainer` `onSuccess` + toast. `admin-products-view` patches `listItems`, closes sheet via `syncAdminSheetUrl`.
2. **Smart writes** — scalar diff; `diffProductSpecs` (create/update/delete only changed); skip gallery when `imageOrder` unchanged; batch image sort via `$transaction` (`lib/admin/product-write.ts`).
3. **Slim list** — `fetchAdminProducts` uses `adminProductSlimInclude` (no images/description). Edit hydrates via `loadAdminProductSheetAction` (`lib/catalog/product-sheet-meta.ts` + `lib/admin/product-row.ts`).
4. **Cache** — `lib/catalog/root-attributes-cache.ts` wraps root attrs with `unstable_cache` + catalog tag.
5. **Index** — `Product @@index([archivedAt, createdAt])` in schema; applied with `prisma db execute` (PgBouncer `db push` failed on prepared statements).
6. **Archive tabs** — local state + `history.replaceState`, no `router.replace`.

## i18n
`Admin.productSaved` uk/en/de.

## Verify
Save one field → no ~2s `GET /admin/products` remount; toast «Збережено»; list updates. Unchanged gallery/specs → no wipe/N updates.