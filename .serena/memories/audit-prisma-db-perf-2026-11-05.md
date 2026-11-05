# Prisma/DB performance audit (read-only) — 2026-11-05

Scope: schema indexes vs where, utils/actions findMany/include, lib/catalog query builders, duplicate fetches (account/catalog/PDP), PgBouncer/singleton, raw SQL/pagination. No code edits.

## Critical / High
1. **Admin inventory full fetch** — `fetchAdminProducts` + `fetchAdminFilterAvailabilityIndex` on `/admin/products`: unpaginated products×specs + full availability index. Client pagination only (`admin-list-pagination-inventory-2026-11-04`).
2. **Public filter availability index** — `loadFilterAvailabilityIndex`: all published products + facet specs; shipped to catalog/home via `unstable_cache` (60s). Cold miss / tag bust scales with inventory.
3. **Catalog where shape** — `catalogQueryToWhere`: status+archivedAt + AND of `specs.some` + ILIKE name/productCode. Missing composite Product index `(status, archivedAt, taxonomyNodeId, createdAt)`; no trigram on name/productCode.
4. **Favorite/Review index gaps** — models have **no** `@@index` / no `@@unique([userId, productId])`. Hot paths: `fetchUserFavoriteIds`, `fetchFavoriteId`, `fetchUserFavorites`, reviews by productId.

## Medium
5. `productListSelect` always loads **all** specs (+ up to 8 images) for catalog/related/favorites cards.
6. PDP: `generateMetadata` + `fetchSingleProduct` double product read; `resolveProductsAreUnique` / `getPathNodes` per-level `findUnique` walks; `resolveProductsAreUniqueByNodeIds` fans out walks.
7. Account: `fetchUserFavorites` / `fetchUserOrders` no take/skip (tab-lazy only).
8. `mapFilterNodes`: per-leaf `fetchAttributesForNode` + `numberBoundsForAttribute` (cached schema).
9. Admin users/orders/inquiries/archive: full findMany; users include `_count` products+orders.
10. Catalog page: `fetchUserFavoriteIds` loads **all** user favorites, not page productIds.

## Low / Ops
11. `utils/db.ts` singleton + `connection_limit=5` / `pool_timeout=20`; `pgbouncer=true` expected in env `DATABASE_URL`. Production relies on module cache (global assign only in non-prod). Multi-worker ×5 can pressure PgBouncer.
12. No app `$queryRaw` (only `.cursor/scripts`). `enrichFilterSchemaForQuery` is dead O(leaves×facets) storm if rewired.
13. Public catalog `fetchAllProductsUncached` has skip/take — OK.

## Remediations (suggested, not done)
- Add Favorite `@@unique([userId, productId])` + indexes; Review `@@index([productId])`, `@@index([userId, productId])`.
- Product composite indexes for public list/related.
- Server-side admin pagination; slim list select without full specs or join facet index separately.
- Trim card specs to layout slots; scope favorites query to page ids.
- Batch taxonomy ancestry (single tree fetch / CTE) instead of per-node walks.
- Consider GIN trigram for search; materialize or incremental availability index.