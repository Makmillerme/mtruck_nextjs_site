import { unstable_cache } from "next/cache";
import {
  CATALOG_CACHE_REVALIDATE_SECONDS,
  CATALOG_CACHE_TAGS,
} from "@/lib/catalog/cache-tags";
import db from "@/utils/db";

/** One product’s facet values (expanded form — admin row match / demos). */
export type FilterAvailabilityRow = {
  /** Ancestors + self taxonomy slugs (folder match = slug ∈ path). */
  pathSlugs: string[];
  specs: Record<string, string | number | boolean>;
};

/**
 * Wire format for RSC → client: path slug chains deduped; rows store pathIdx.
 * Cuts repeated pathSlugs arrays across products in the same folder.
 */
export type FilterAvailabilityIndex = {
  paths: string[][];
  rows: Array<{
    pathIdx: number;
    specs: Record<string, string | number | boolean>;
  }>;
};

export function availabilityPathSlugs(
  index: FilterAvailabilityIndex,
  pathIdx: number
): string[] {
  return index.paths[pathIdx] ?? [];
}

/** Pack expanded rows into the compact index shipped to the browser. */
export function compactAvailabilityIndex(
  rows: FilterAvailabilityRow[]
): FilterAvailabilityIndex {
  const pathKeyToIdx = new Map<string, number>();
  const paths: string[][] = [];
  const compactRows: FilterAvailabilityIndex["rows"] = [];

  for (const row of rows) {
    const key = row.pathSlugs.join("\0");
    let pathIdx = pathKeyToIdx.get(key);
    if (pathIdx == null) {
      pathIdx = paths.length;
      pathKeyToIdx.set(key, pathIdx);
      paths.push(row.pathSlugs);
    }
    compactRows.push({ pathIdx, specs: row.specs });
  }

  return { paths, rows: compactRows };
}

export function expandAvailabilityRow(
  index: FilterAvailabilityIndex,
  row: FilterAvailabilityIndex["rows"][number]
): FilterAvailabilityRow {
  return {
    pathSlugs: availabilityPathSlugs(index, row.pathIdx),
    specs: row.specs,
  };
}

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

async function loadFilterAvailabilityIndex(options?: {
  /** When true, include every non-archived product (admin lists). */
  includeAllStatuses?: boolean;
}): Promise<FilterAvailabilityIndex> {
  const includeAllStatuses = options?.includeAllStatuses === true;
  const [nodes, products] = await Promise.all([
    db.taxonomyNode.findMany({
      select: { id: true, slug: true, parentId: true },
    }),
    db.product.findMany({
      where: includeAllStatuses
        ? { archivedAt: null }
        : { status: "PUBLISHED", archivedAt: null },
      select: {
        taxonomyNodeId: true,
        specs: {
          where: {
            attribute: {
              OR: [{ isFacet: true }, { showInHomeFilter: true }],
            },
          },
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

  const expanded: FilterAvailabilityRow[] = products.map((product) => {
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

  return compactAvailabilityIndex(expanded);
}

/** Cached inventory × facet index for live draft narrowing (public catalog). */
export async function fetchFilterAvailabilityIndex(): Promise<FilterAvailabilityIndex> {
  return unstable_cache(
    () => loadFilterAvailabilityIndex(),
    ["filter-availability-index-v2"],
    {
      revalidate: CATALOG_CACHE_REVALIDATE_SECONDS,
      tags: [CATALOG_CACHE_TAGS.root, CATALOG_CACHE_TAGS.availability],
    }
  )();
}

/** Admin products list — all non-archived statuses for facet narrowing. */
export async function fetchAdminFilterAvailabilityIndex(): Promise<FilterAvailabilityIndex> {
  return unstable_cache(
    () => loadFilterAvailabilityIndex({ includeAllStatuses: true }),
    ["admin-filter-availability-index-v2"],
    {
      revalidate: CATALOG_CACHE_REVALIDATE_SECONDS,
      tags: [CATALOG_CACHE_TAGS.root, CATALOG_CACHE_TAGS.availability],
    }
  )();
}

/** Export path helper for client-side admin row matching. */
export { buildPathSlugs };
