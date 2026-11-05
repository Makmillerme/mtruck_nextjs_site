# Full performance audit rollup (2026-11-05)

Sources: storefront audit (`perf-storefront-audit-2026-11-05`), Prisma (`audit-prisma-db-perf-2026-11-05`), admin (`admin-perf-audit-2026-11-05`), plan (`plan-perf-audit-remediation-2026-11-05`).

## Counts
- Storefront: ~40 findings P0–P2
- Admin: 32 findings P0–P2
- Prisma/DB: 14 ranked items + index cheat-sheet

## Shared P0 (all three agree)
1. FilterAvailabilityIndex = full inventory → client (home + /products + admin products)
2. productListSelect / adminProductSlimInclude over-fetch ALL specs
3. Admin lists: no Prisma take/skip (client pagination only)
4. Favorite/Review missing indexes; Product/Order composites weak
5. revalidateCatalog / revalidatePublicCatalog / inquiries layout bust storms

## Admin-only P0 addenda
- Sales hard redirect + dump all users/products for pickers
- Formation regenerate N+1
- Inquiries mark-read → layout revalidate + router.refresh

## Remotion phases (approved plan default)
0 requestInsights → 1 indexes → 2 storefront payload → 3 admin server pagination → 4 revalidate/write storms → 5 chrome/PDP/account/client weight

Status: Plan awaiting user confirm before Agent/Serena implementation.