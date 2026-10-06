# Session 2026-09-29 — remove Product.company / featured remnants (query/UI)

## Scope (8 files only)
Removed public-catalog remnants of `Product.company` and `featuredOnly` / URL `featured` param. Partnership form `company` in `utils/actions.ts` (~line 771 `formData.get('company')`) was **kept**.

## Changes
1. **utils/catalog-query.ts** — dropped `featuredOnly` from `CatalogQuery`, `CatalogHrefPatch`, `parseFeaturedOnly`, parse/build/clear/reset, `countActiveCatalogFilters`, `catalogQueryIsFiltered`; no `featured` URL param.
2. **utils/actions.ts** — `fetchAllProductsUncached` / `fetchAllProducts` no longer take or pass `featuredOnly` to `catalogQueryToWhere`. Product selects no longer include `company: true` (orders, admin form options, archived products/orders). Partnership `company` kept.
3. **components/products/ProductsContainer.tsx** — stop passing `featuredOnly`.
4. **components/products/catalog-filters.tsx** — removed `featuredOnly: false` from draft active-count reset.
5. **app/[locale]/products/page.tsx** — stop passing `featuredOnly`.
6. **lib/catalog/product-to-vehicle.ts** — removed `company` from input; `categoryLabel = taxonomyNode?.name ?? optionLabel(specs, "make") ?? null`.
7. **components/vehicles/vehicle-card.tsx** — `productToVehicle` takes optional `categoryLabel` instead of `company`.
8. **app/[locale]/products/[id]/page.tsx** — removed company display line under title.

## Not touched
- Admin products page, `product-list.ts`, schemas, partnership form UI, `fetchFeaturedProducts` name (homepage latest published, no featured flag).
