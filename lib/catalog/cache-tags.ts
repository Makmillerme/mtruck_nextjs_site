/**
 * Tags / TTL for public catalog `unstable_cache` entries.
 * Safe for any importer (no `next/cache` APIs here).
 * Attach `root` to every catalog cache; bust via `revalidatePublicCatalog()`.
 */
export const CATALOG_CACHE_TAGS = {
  root: "catalog",
  products: "catalog-products",
  filterSchema: "catalog-filter-schema",
  availability: "catalog-filter-availability",
} as const;

/** TTL for visitor traffic when no on-demand invalidation ran. */
export const CATALOG_CACHE_REVALIDATE_SECONDS = 60;
