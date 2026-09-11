# Catalog taxonomy plan (2026-09-11)

User: admin + cascade fields BEFORE public catalog UI. Not hardcoded vehicle columns.

## Current
`Product` is furniture: name, company, description, featured, image, price. Finder categories/brands are mock in `lib/home/category-finder.ts`. Admin create is faker company form.

## Intent
Clusters (folders) → categories → subtype attributes → make → model → modification → TTX array. Dependent fields, not a fixed template. Filters generated from definitions + values that exist on products.

## Do not nest Make under subtype
Scania would be duplicated under every folder. Split:
1. **TaxonomyNode** tree (cluster / category / subtype) — folders in admin.
2. **AttributeDefinition** on a node (inherit down): select | number | text | bool | year. `dependsOnAttributeId` for cascade. `isFacet` for filters. `isIdentity` for make/model/mod.
3. **AttributeOption** with `parentOptionId` (R450 only under Scania).
4. Slim **Product**: status, price, images, taxonomyNodeId, featured.
5. **ProductSpec**: optionId and/or numeric/text value.

Make/model/mod = cascade dictionaries, optionally scoped to taxonomy, not child folders of «Контейнеровози».

## Filters
Facets from `isFacet` defs on current node+ancestors. Options = distinct values on the **current product set** (hide empty). Ranges for price/year/km as numeric specs.

## Phases
0 schema → 1 admin taxonomy+attrs → 2 generated product form → 3 seed one cluster, drop furniture → 4 public `/products` facets → 5 homepage finder from DB.

No Payload. Prisma. Cart stays unused for vehicles.
