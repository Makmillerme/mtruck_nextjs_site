import { unstable_cache } from "next/cache";
import {
  CATALOG_CACHE_REVALIDATE_SECONDS,
  CATALOG_CACHE_TAGS,
} from "@/lib/catalog/cache-tags";
import { fetchRootCatalogAttributes as loadRootCatalogAttributes } from "@/lib/catalog/taxonomy";

/** Cached for admin products table columns — busted with catalog root tag. */
export async function fetchRootCatalogAttributes() {
  const cached = unstable_cache(
    () => loadRootCatalogAttributes(),
    ["admin-root-catalog-attributes"],
    {
      revalidate: CATALOG_CACHE_REVALIDATE_SECONDS,
      tags: [CATALOG_CACHE_TAGS.root],
    }
  );
  return cached();
}
