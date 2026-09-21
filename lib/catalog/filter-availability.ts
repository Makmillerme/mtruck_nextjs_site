import { unstable_cache } from "next/cache";
import {
  CATALOG_CACHE_REVALIDATE_SECONDS,
  CATALOG_CACHE_TAGS,
} from "@/lib/catalog/cache-tags";
import db from "@/utils/db";

/** One published product’s facet values for client-side narrowing. */
export type FilterAvailabilityRow = {
  /** Ancestors + self taxonomy slugs (folder match = slug ∈ path). */
  pathSlugs: string[];
  specs: Record<string, string | number | boolean>;
};

export type FilterAvailabilityIndex = {
  rows: FilterAvailabilityRow[];
};

function buildPathSlugs(
  nodeId: string | null,
  byId: Map<string, { id: string; slug: string; parentId: string | null }>
): string[] {
  const path: string[] = [];
  let current: string | null = nodeId;
  const guard = new Set<string>();
  while (current && !guard.has(current)) {
    guard.add(current);
    const node = byId.get(current);
    if (!node) break;
    path.push(node.slug);
    current = node.parentId;
  }
  return path;
}

async function loadFilterAvailabilityIndex(): Promise<FilterAvailabilityIndex> {
  const [nodes, products] = await Promise.all([
    db.taxonomyNode.findMany({
      select: { id: true, slug: true, parentId: true },
    }),
    db.product.findMany({
      where: { status: "PUBLISHED", archivedAt: null },
      select: {
        taxonomyNodeId: true,
        specs: {
          where: { attribute: { isFacet: true } },
          select: {
            numberValue: true,
            booleanValue: true,
            option: { select: { slug: true } },
            attribute: { select: { key: true, type: true } },
          },
        },
      },
    }),
  ]);

  const byId = new Map(nodes.map((node) => [node.id, node]));

  const rows: FilterAvailabilityRow[] = products.map((product) => {
    const specs: Record<string, string | number | boolean> = {};
    for (const spec of product.specs) {
      const key = spec.attribute.key;
      if (spec.option?.slug) {
        specs[key] = spec.option.slug;
      } else if (
        (spec.attribute.type === "NUMBER" || spec.attribute.type === "YEAR") &&
        spec.numberValue != null
      ) {
        specs[key] = spec.numberValue;
      } else if (
        spec.attribute.type === "BOOLEAN" &&
        spec.booleanValue != null
      ) {
        specs[key] = spec.booleanValue;
      }
    }
    return {
      pathSlugs: buildPathSlugs(product.taxonomyNodeId, byId),
      specs,
    };
  });

  return { rows };
}

/** Cached inventory × facet index for live draft narrowing. */
export async function fetchFilterAvailabilityIndex(): Promise<FilterAvailabilityIndex> {
  return unstable_cache(
    loadFilterAvailabilityIndex,
    ["filter-availability-index"],
    {
      revalidate: CATALOG_CACHE_REVALIDATE_SECONDS,
      tags: [CATALOG_CACHE_TAGS.root, CATALOG_CACHE_TAGS.availability],
    }
  )();
}
