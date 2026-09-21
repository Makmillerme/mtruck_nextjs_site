import { revalidatePath, updateTag } from "next/cache";
import { CATALOG_CACHE_TAGS } from "@/lib/catalog/cache-tags";

export {
  CATALOG_CACHE_REVALIDATE_SECONDS,
  CATALOG_CACHE_TAGS,
} from "@/lib/catalog/cache-tags";

type RevalidatePublicCatalogOptions = {
  /** Also invalidate the product detail route. */
  productId?: string;
};

/**
 * Immediate catalog cache bust from Server Actions (Next 16 `updateTag`).
 * Prefer this over `revalidateTag(..., "max")` so admin changes are visible
 * on the next public request without waiting for stale-while-revalidate.
 *
 * Import only from Server Actions / server modules — not from client components
 * or shared modules that client code imports (use `cache-tags` for constants).
 */
export function revalidatePublicCatalog(
  options?: RevalidatePublicCatalogOptions
) {
  updateTag(CATALOG_CACHE_TAGS.root);
  revalidatePath("/products");
  if (options?.productId) {
    revalidatePath(`/products/${options.productId}`);
  }
}
