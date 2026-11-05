# Perf remediation Phase 0+1 (2026-11-05)

User confirmed full audit plan. Full report: `perf-audit-full-report-2026-11-05`.

## Phase 0 — Observability
- `next.config.mjs`: `experimental.requestInsights: true` (alongside serverActions bodySizeLimit).
- **Requires restart of `next dev`** for MCP `get_request_insights` to work.

## Phase 1 — Prisma indexes (db push applied to DIRECT_URL)
Schema `prisma/schema.prisma`:
- **Product**: `@@index([status, archivedAt, createdAt])`, `@@index([status, archivedAt, taxonomyNodeId, createdAt])`, `@@index([status, archivedAt, price])`
- **Favorite**: `@@unique([userId, productId])`, `@@index([userId])`, `@@index([productId])`
- **Review**: `@@unique([userId, productId])`, `@@index([productId])`, `@@index([userId])`
- **Order**: `@@index([userId, archivedAt, createdAt])`

Pre-check: no duplicate (userId, productId) on Favorite/Review.

## Code using new unique
- `utils/actions.ts`: `fetchFavoriteId`, createReview existing check, fetchExistingReview → `findUnique({ where: { userId_productId } })`

## Ops note
- `prisma generate` hit EPERM (query_engine DLL locked by running next dev). Types already show `userId_productId`. After restart: `npx prisma generate` if needed.

## Next: Phase 2
Slim `productListSelect` + rethink FilterAvailabilityIndex client payload + batch public-filter cold bounds.