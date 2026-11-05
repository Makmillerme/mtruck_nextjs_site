# Public storefront performance audit (2026-11-05)

Read-only investigation of homepage, catalog, PDP, account cabinet.

## Top P0
1. `lib/catalog/filter-availability.ts` — loads ALL published products + facet specs; serialized to client via CatalogView + CategoryFinderPanel (home + /products). Cached 60s but payload grows with inventory.
2. `utils/product-list.ts` `productListSelect` — all specs + up to 8 gallery images per list/card/related/featured row; cards only need layout slot keys.
3. `lib/catalog/public-filter.ts` `mapFilterNodes` — per-leaf `fetchAttributesForNode` + per NUMBER/YEAR `numberBoundsForAttribute` aggregates (N+1); cold cache expensive. `attributeInclude` loads all options.

## P1 highlights
- Navbar (`components/navbar/Navbar.tsx`): getSession + getUserRole (redundant vs session context row) + ensureUserCode every layout; staff also inquiry count/list.
- `Favorite`/`Review` models: no @@index; Product missing composite (status, archivedAt[, createdAt]); Order missing (userId, archivedAt).
- `fetchFeaturedProducts` uncached; homepage CatalogFeaturedGrid hits DB every request.
- PDP: generateMetadata separate uncached findUnique; page uses cookies() → dynamic; resolveProductsAreUnique parent walk; fetchAttributesForNode all options; related limit 12 with full list select; dual mobile+desktop DOM for related.
- ProductCard is "use client" + Embla PhotoCarousel per card → heavy client bundle on grids.
- Account: fetchUserOrders / fetchUserFavorites unbounded findMany; AccountCabinetView client pulls ProductCard/carousel for favorites.
- Catalog: ProductsCatalogBody awaits schema+availability before results Suspense; cookies() on /products forces dynamic.
- Catalog TTL 60s only (`CATALOG_CACHE_REVALIDATE_SECONDS`); search uses ILIKE contains without supporting index.
- Global Providers mount CtaInquiry + OrderAddedSheet on every page.

## Suggested directions (no code in this pass)
- Slim list select to card-preview slot keys; server-render static cover image for cards.
- Compress availability (ids/bitsets) or server-side narrow; don't ship full inventory to browser.
- Batch bounds aggregates; cache attribute defs; composite DB indexes.
- Dedupe navbar user row; defer staff notifications.
- Paginate account lists; cache featured; avoid cookies on PDP when possible (header flash).
