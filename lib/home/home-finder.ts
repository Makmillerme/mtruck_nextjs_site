import { unstable_cache } from "next/cache";
import {
  CATALOG_CACHE_REVALIDATE_SECONDS,
  CATALOG_CACHE_TAGS,
} from "@/lib/catalog/cache-tags";
import { fetchFilterAvailabilityIndex } from "@/lib/catalog/filter-availability";
import {
  numberBoundsForAttribute,
  sortPublicFacets,
  toPublicFacet,
} from "@/lib/catalog/public-filter";
import {
  collectSubtreeIds,
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

async function publishedCountByNodeIds(
  nodeIds: string[]
): Promise<Map<string, number>> {
  if (nodeIds.length === 0) return new Map();
  const rows = await db.product.groupBy({
    by: ["taxonomyNodeId"],
    where: {
      taxonomyNodeId: { in: nodeIds },
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

async function subtreePublishedCount(nodeId: string): Promise<number> {
  const ids = await collectSubtreeIds(nodeId);
  const byNode = await publishedCountByNodeIds(ids);
  let total = 0;
  for (const id of ids) total += byNode.get(id) ?? 0;
  return total;
}

/** Same facet build as catalog `mapFilterNodes`, gated by showInHomeFilter. */
async function facetsForNode(nodeId: string): Promise<HomeFinderFacet[]> {
  const attributes = resolveAttributesByKey(
    await fetchAttributesForNode(nodeId)
  );
  const byId = new Map(attributes.map((item) => [item.id, item]));
  const subtreeIds = await collectSubtreeIds(nodeId);
  const facets: HomeFinderFacet[] = [];
  const seen = new Set<string>();

  for (const attribute of attributes) {
    if (!attribute.showInHomeFilter) continue;
    const facet = toPublicFacet(attribute, byId);
    if (!facet || seen.has(facet.key)) continue;
    seen.add(facet.key);

    if (facet.type === "NUMBER" || facet.type === "YEAR") {
      const bounds = await numberBoundsForAttribute(facet.key, subtreeIds);
      facet.minBound = bounds.minBound;
      facet.maxBound = bounds.maxBound;
    }

    facets.push({
      key: facet.key,
      name: facet.name,
      type: facet.type as HomeFinderFacet["type"],
      unit: facet.unit,
      dependsOnKey: facet.dependsOnKey,
      options: facet.options,
      minBound: facet.minBound ?? null,
      maxBound: facet.maxBound ?? null,
    });
  }

  return sortPublicFacets(facets) as HomeFinderFacet[];
}

async function mapFolderNode(
  node: TaxonomyTreeNode,
  depth: number
): Promise<HomeFinderChild> {
  const children =
    depth >= HOME_FILTER_MAX_DEPTH
      ? []
      : await Promise.all(
          node.children.map((child) => mapFolderNode(child, depth + 1))
        );
  return {
    id: node.id,
    slug: node.slug,
    name: node.name,
    productCount: await subtreePublishedCount(node.id),
    facets: await facetsForNode(node.id),
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

async function mapRoot(node: TaxonomyTreeNode): Promise<HomeFinderRoot> {
  const nested = await Promise.all(
    node.children.map((child) => mapFolderNode(child, 2))
  );
  /** Leaf root: expose self as the only child so facets/CTA still bind. */
  const children =
    nested.length > 0 ? nested : [await mapFolderNode(node, 2)];

  return {
    id: node.id,
    slug: node.slug,
    name: node.name,
    productCount: await subtreePublishedCount(node.id),
    children,
  };
}

async function loadHomeFinderTree(): Promise<
  Omit<HomeFinderPayload, "availability">
> {
  const tree = await fetchTaxonomyTree();
  const homeTree = mapHomeFilterNodes(tree);
  const roots = await Promise.all(homeTree.map(mapRoot));
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
