# Plan: комплексний perf-аудит + remediation (2026-11-05)

Status: Plan mode — awaiting user approval before Agent/Serena implementation.

## Method
- Parallel storefront / admin / Prisma audits + prior memories (admin-perf, product-save-slow, home-finder-perf, account-cabinet-perf).
- next-devtools: routes OK, no errors; requestInsights NOT enabled.

## Default priority
Public TTFB/payload first → admin list/save → chrome/PDP/account → client bundle.

## Phases
0 Observability (requestInsights)
1 Prisma indexes Favorite/Review/Product/Order
2 Slim productListSelect + rethink FilterAvailabilityIndex client payload
3 Admin products server pagination; defer filter schema when sheet closed
4 Revalidate/write storms; inquiries mark-read; sales soft-save
5 Navbar/PDP/account; ProductCard weight; featured cache

## P0 findings
- filter-availability full inventory → client (home+/products)
- productListSelect all specs + 8 images
- admin fetchAdminProducts all rows×specs + availability index (client page only)
- Favorite/Review no indexes; Product missing composites
- public-filter cold N+1 bounds/attrs
- revalidatePublicCatalog / taxonomy revalidate storms
- inquiries mark-read + layout revalidate every visit

## Already done (do not redo)
session React.cache; admin slim no gallery; client AdminTablePagination; home-finder batch; soft-save products/users; account tab-lazy fetch.