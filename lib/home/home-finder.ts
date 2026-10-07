import { unstable_cache } from "next/cache";
import {
  CATALOG_CACHE_REVALIDATE_SECONDS,
  CATALOG_CACHE_TAGS,
} from "@/lib/catalog/cache-tags";
import { fetchFilterAvailabilityIndex } from "@/lib/catalog/filter-availability";
import {
  sortPublicFacets,
  toPublicFacet,
} from "@/lib/catalog/public-filter";
import {
  fetchAttributesForNode,
  fetchTaxonomyTree,
  resolveAttributesByKey,
} from "@/lib/catalog/taxonomy";
import type { TaxonomyTreeNode } from "@/lib/catalog/types";
import {
  HOME_FILTER_MAX_DEPTH,
  type HomeFinderChild,
  type HomeFinderFacet,
  type HomeFinderPayload,
  type HomeFinderRoot,
} from "@/lib/home/home-finder-shared";
import db from "@/utils/db";

export {
  HOME_FILTER_MAX_DEPTH,
  buildHomeFinderProductsHref,
  resolveHomeFinderDefaults,
  type HomeFinderChild,
  type HomeFinderFacet,
  type HomeFinderFacetOption,
  type HomeFinderPayload,
  type HomeFinderRoot,
} from "@/lib/home/home-finder-shared";

/** One groupBy for the whole catalog — subtree totals are summed in memory. */
async function publishedCountByNodeId(): Promise<Map<string, number>> {
  const rows = await db.product.groupBy({
    by: ["taxonomyNodeId"],
    where: {
      taxonomyNodeId: { not: null },
      status: "PUBLISHED",
      archivedAt: null,
    },
    _count: { _all: true },
  });
  return new Map(
    rows
      .filter((row) => row.taxonomyNodeId)
      .map((row) => [row.taxonomyNodeId as string, row._count._all])
  );
}

function subtreePublishedCount(
  node: TaxonomyTreeNode,
  byNode: Map<string, number>
): number {
  let total = byNode.get(node.id) ?? 0;
  for (const child of node.children) {
    total += subtreePublishedCount(child, byNode);
  }
  return total;
}

/**
 * Facet definitions only — no per-attribute SQL aggregates.
 * Bounds/options are narrowed client-side via availability (catalog parity).
 */
async function facetsForNode(nodeId: string): Promise<HomeFinderFacet[]> {
  const attributes = resolveAttributesByKey(
    await fetchAttributesForNode(nodeId)
  );
  const byId = new Map(attributes.map((item) => [item.id, item]));
  const facets: HomeFinderFacet[] = [];
  const seen = new Set<string>();

  for (const attribute of attributes) {
    if (!attribute.showInHomeFilter) continue;
    const facet = toPublicFacet(attribute, byId);
    if (!facet || seen.has(facet.key)) continue;
    seen.add(facet.key);
    facets.push({
      key: facet.key,
      name: facet.name,
      type: facet.type as HomeFinderFacet["type"],
      unit: facet.unit,
      dependsOnKey: facet.dependsOnKey,
      options: facet.options,
      minBound: null,
      maxBound: null,
    });
  }

  return sortPublicFacets(facets) as HomeFinderFacet[];
}

async function mapFolderNode(
  node: TaxonomyTreeNode,
  depth: number,
  byNode: Map<string, number>
): Promise<HomeFinderChild> {
  const children =
    depth >= HOME_FILTER_MAX_DEPTH
      ? []
      : await Promise.all(
          node.children.map((child) => mapFolderNode(child, depth + 1, byNode))
        );
  /** Only leaves drive the plate — parents inherit selection via UI. */
  const isLeaf = children.length === 0;
  return {
    id: node.id,
    slug: node.slug,
    name: node.name,
    productCount: subtreePublishedCount(node, byNode),
    facets: isLeaf ? await facetsForNode(node.id) : [],
    children,
  };
}

/**
 * Same hoist rules as catalog `mapFilterNodes`, but for `showInHomeFilter`:
 * hidden folders omit themselves; visible descendants rise to this level.
 */
function mapHomeFilterNodes(nodes: TaxonomyTreeNode[]): TaxonomyTreeNode[] {
  const result: TaxonomyTreeNode[] = [];
  for (const node of nodes) {
    if (!node.isActive) continue;
    const children = mapHomeFilterNodes(node.children);
    if (!node.showInHomeFilter) {
      result.push(...children);
      continue;
    }
    result.push({ ...node, children });
  }
  return result;
}

async function mapRoot(
  node: TaxonomyTreeNode,
  byNode: Map<string, number>
): Promise<HomeFinderRoot> {
  const nested = await Promise.all(
    node.children.map((child) => mapFolderNode(child, 2, byNode))
  );
  /** Leaf root: expose self as the only child so facets/CTA still bind. */
  const children =
    nested.length > 0 ? nested : [await mapFolderNode(node, 2, byNode)];

  return {
    id: node.id,
    slug: node.slug,
    name: node.name,
    productCount: subtreePublishedCount(node, byNode),
    children,
  };
}

async function loadHomeFinderTree(): Promise<
  Omit<HomeFinderPayload, "availability">
> {
  const [tree, byNode] = await Promise.all([
    fetchTaxonomyTree(),
    publishedCountByNodeId(),
  ]);
  const homeTree = mapHomeFilterNodes(tree);
  const roots = await Promise.all(
    homeTree.map((root) => mapRoot(root, byNode))
  );
  return {
    showRootsBlock: roots.length > 0,
    roots,
  };
}

export async function fetchHomeFinderPayload(): Promise<HomeFinderPayload> {
  const cachedTree = unstable_cache(loadHomeFinderTree, ["home-finder-payload"], {
    revalidate: CATALOG_CACHE_REVALIDATE_SECONDS,
    tags: [CATALOG_CACHE_TAGS.root, CATALOG_CACHE_TAGS.homeFinder],
  });
  const [tree, availability] = await Promise.all([
    cachedTree(),
    fetchFilterAvailabilityIndex(),
  ]);
  return { ...tree, availability };
}
