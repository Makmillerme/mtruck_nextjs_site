# Catalog public filter from CMS (2026-09)

Public `/products` filter is generated from admin catalog, not hardcoded brands.

## Admin switches
- Folder: `TaxonomyNode.showInFilter` (default true). Edit/create folder sheet + label «не в фільтрі» in tree.
- Field: existing `AttributeDefinition.isFacet` (CatalogAdmin.flagFacet).

## Public
- `lib/catalog/public-filter.ts`: `fetchPublicFilterSchema` + `catalogQueryToWhere`
- URL: `folder=slug,slug`, per-folder `f.{folderSlug}.{key}=slug,slug` and `f.{folderSlug}.{key}Min|Max`, plus legacy `f.{key}` / `f.{key}Min|Max`, search/sort/layout/featured
- Legacy: `category`→folder, `make`/`brand`→`f.make`, `yearFrom`/`kmFrom`→ranges
- Homepage finder `buildProductsHref` writes the new params (folder slugs mapped from mock category ids)

## Visual
Same checkbox/range stack as before. Look-and-feel TBD — data path is live.

Restart `next dev` after schema: `prisma generate` was EPERM while dev locked the query engine.
