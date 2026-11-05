/**
 * Tags / TTL for public catalog `unstable_cache` entries.
 * Safe for any importer (no `next/cache` APIs here).
 * Attach `root` for structural catalog caches; product-scoped busts skip `root`
 * (see `revalidatePublicCatalog({ scope: "product" })`).
 */
export const CATALOG_CACHE_TAGS = {
  root: "catalog",
  products: "catalog-products",
  filterSchema: "catalog-filter-schema",
  availability: "catalog-filter-availability",
  homeFinder: "catalog-home-finder",
} as const;

/** TTL for visitor traffic when no on-demand invalidation ran. */
export const CATALOG_CACHE_REVALIDATE_SECONDS = 60;
