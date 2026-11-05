import { unstable_cache } from "next/cache";
import {
  CATALOG_CACHE_REVALIDATE_SECONDS,
  CATALOG_CACHE_TAGS,
} from "@/lib/catalog/cache-tags";
import { CARD_LIST_ALWAYS_KEYS } from "@/utils/product-list";
import db from "@/utils/db";

/**
 * Union of attribute keys needed for every product card (all card-preview
 * slot + subtitle keys + hardcoded year/location/make).
 * Cached; busts with catalog root tag when layouts change via revalidatePublicCatalog.
 */
export async function fetchAllCardPreviewSpecKeys(): Promise<string[]> {
  return unstable_cache(
    async () => {
      const rows = await db.cardPreviewLayout.findMany({
        select: {
          slots: {
            select: { attribute: { select: { key: true } } },
          },
          subtitleSlots: {
            select: { attribute: { select: { key: true } } },
          },
        },
      });
      const keys = new Set<string>(CARD_LIST_ALWAYS_KEYS);
      for (const row of rows) {
        for (const slot of row.slots) {
          if (slot.attribute.key) keys.add(slot.attribute.key);
        }
        for (const slot of row.subtitleSlots) {
          if (slot.attribute.key) keys.add(slot.attribute.key);
        }
      }
      return [...keys];
    },
    ["card-preview-spec-keys-v1"],
    {
      revalidate: CATALOG_CACHE_REVALIDATE_SECONDS,
      tags: [CATALOG_CACHE_TAGS.root, CATALOG_CACHE_TAGS.products],
    }
  )();
}
