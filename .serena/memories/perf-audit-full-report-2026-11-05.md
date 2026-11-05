# COMPREHENSIVE PERFORMANCE AUDIT — FULL REPORT (2026-11-05)

User confirmed remediation plan. Implementation starts Phase 0+1 (Agent + Serena).

Method: parallel storefront / admin / Prisma audits + prior memories + Next MCP (routes OK, errors none; requestInsights was DISABLED).

Default priority: public TTFB/payload → admin list/save → chrome/PDP/account → client bundle.

---

## ALREADY DONE (do not redo)
- React.cache on session helpers; archive tabs without full GET
- Admin slim list without gallery images; client AdminTablePagination phase 1
- Home-finder batch (no per-folder aggregate storm)
- Account tab-lazy fetch; soft-save products/users (partial)
- Catalog list skip/take + count; unstable_cache + updateTag for public catalog

---

## PHASES (APPROVED)
0. Observability — enable experimental.requestInsights; baseline hot routes
1. Prisma indexes — Favorite unique+indexes, Review indexes, Product composites, Order (userId, archivedAt)
2. Storefront payload — slim productListSelect; rethink FilterAvailabilityIndex client dump; batch public-filter cold N+1
3. Admin products — server skip/take; defer filter schema/availability; sheet-by-id fetch
4. Write/revalidate storms — narrow tags; sales soft-save; inquiries no layout bust; formation batch
5. Chrome/PDP/account/client — navbar dedupe; PDP dup query; featured cache; ProductCard weight; account caps

---

## STOREFRONT FINDINGS (~40)

### P0
1. filter-availability.ts — ALL PUBLISHED products+facet specs → rows[]; cached 60s, grows with inventory
2. ProductsContainer → CatalogView — entire availability into use client
3. home-finder + CategoryFinderPanel — same availability on homepage client
4. product-list.ts productListSelect — ALL specs + up to 8 images per card/list/related/featured
5. public-filter mapFilterNodes — per-leaf fetchAttributesForNode + numberBounds aggregates N+1
6. taxonomy attributeInclude — all options on facet schema paths

### P1
7. Navbar — getSession + getUserRole again + ensureUserCode every layout
8. Staff on storefront — countUnread + recent inquiries every page
9. Favorite — no @@index / @@unique([userId,productId])
10. Product — need composite (status, archivedAt, createdAt) + taxonomy variants
11. Order — need (userId, archivedAt, createdAt)
12. Review — no indexes
13. fetchFeaturedProducts uncached
14. PDP generateMetadata separate uncached findUnique
15. PDP cookies() → dynamic
16. /products cookies() layout → dynamic
17. ProductCard use client + Embla per card
18. photo-carousel Embla even for single image
19. ProductsCatalogBody awaits schema+availability before results Suspense
20. fetchUserOrders / fetchUserFavorites unbounded
21. fetchUserFavoriteIds all favorites not page ids
22. resolveProductsAreUnique parent walk 1 query/level
23. catalogTextSearchClause ILIKE no trigram
24. related limit 12 full list select UI shows ~4
25. related dual mobile+desktop DOM
26. PDP fetchAttributesForNode all options redundant with specs
27. CATALOG_CACHE_REVALIDATE_SECONDS = 60 only
28. AccountCabinetView client pulls ProductCard for favorites

### P2
29. providers global CtaInquiry + OrderAddedSheet
30. catalog-view heavy client sheet/dropdown
31. ShopNavbar MutationObserver
32. layout getMessages full locale JSON
33–40. lightbox dynamic, featured Suspense, card-preview uncached layouts, facet some-chains, hero srcset, cache tag align, proxy OK

---

## ADMIN FINDINGS (32)

### P0
1. fetchAdminProducts full + adminProductSlimInclude all specs — no Prisma take
2. /admin/products Promise.all 5 heavy sources every nav
3. fetchAdminFilterAvailabilityIndex all products
4. Sales create/update hard redirectLocalized remount
5. Sales page dump all orders + all users + all products for pickers
6. Formation regenerate N+1 applyFormationTemplates per product
7. Inquiries mark-read + revalidatePath('/', layout) + router.refresh every visit
8. fetchAdminCallbackInquiries no limit

### P1
9. Soft-save returns thick adminProductListInclude into slim list
10. Save path still 0.5–1.7s DB (attrs+options+formation+spec diff)
11. MULTI_SELECT update deleteMany+createMany loop
12. revalidateCatalog() 5 admin paths + public on taxonomy mutations
13. Archive mutations 3 paths
14. fetchAttributesForNode always all options
15. fetchRootCatalogAttributes full subtree+options
16. Archive SSR loads 3 full sets for one tab
17. UI editor force-dynamic + RSC on tab
18. UI editor loaders duplicate tree + layout scans
19. CMS catalog tab = RSC remount
20. No next/dynamic in admin client trees
21. Filter sheet payload on every products GET
22. Taxonomy tree React.cache only not cross-request unstable_cache
23. Inquiry status update hits layout
24. Soft-save after() revalidatePublicCatalog always busts home/filter

### P2
25–32. client-only pagination phase1; users+_count; collectSubtreeIds; getPathNodes walks; folder remount; users revalidatePath; client search O(n×specs); sidebar full RSC hops

---

## PRISMA / DB FINDINGS

### Critical/High
1. Admin inventory + availability full table
2. Public FilterAvailabilityIndex O(inventory) cold miss expensive
3. catalogQueryToWhere missing Product composites; ILIKE no GIN/trgm; facet via attribute.key weak
4. Favorite/Review zero indexes

### Medium
5. productListSelect over-fetch
6. PDP double product + taxonomy walks
7. Account no take
8. mapFilterNodes cold N+1
9. Admin users/orders/inquiries/archive full findMany
10. Catalog fetchUserFavoriteIds all ids

### Low/Ops
11. db singleton + connection_limit=5 × workers vs PgBouncer
12. No app $queryRaw
13. enrichFilterSchemaForQuery dead storm helper — do not rewire
14. Public catalog pagination OK

### Index cheat-sheet TARGETS
- Product (status, archivedAt, taxonomyNodeId, createdAt) — MISSING
- Product price sort (status, archivedAt, price) — MISSING
- Favorite(userId) + unique(userId, productId) — MISSING
- Review(productId), (userId, productId) — MISSING
- Order(userId, archivedAt, createdAt) — PARTIAL
- ProductSpec(attributeId, optionId), (productId) — OK
- ILIKE trigram — MISSING (later phase)

---

## HOT PATH DIAGRAM
Home/Catalog → FilterAvailabilityIndex + PublicFilterSchema
Catalog/Related/Featured/Favorites → productListSelect
Admin products → fetchAdminProducts + availability + filter schema
Mutations → revalidatePublicCatalog / revalidateCatalog storms
Navbar layout → session + role + userCode + staff inquiries

---

## RISK NOTES
- Availability redesign can break live facet narrowing — keep semantics, compress format
- Admin server pagination vs filter sheet needing inventory — separate availability from product rows
- Index migration on PgBouncer — CONCURRENTLY via PostgressOps when applying to prod

Status: User confirmed 2026-11-05 17:02. Start Phase 0+1.