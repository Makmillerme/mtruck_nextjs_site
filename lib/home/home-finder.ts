import { unstable_cache } from "next/cache";
import {
  CATALOG_CACHE_REVALIDATE_SECONDS,
  CATALOG_CACHE_TAGS,
} from "@/lib/catalog/cache-tags";
import {
  collectSubtreeIds,
  fetchAttributesForNode,
  fetchTaxonomyTree,
} from "@/lib/catalog/taxonomy";
import type { TaxonomyTreeNode } from "@/lib/catalog/types";
import {
  type HomeFinderChild,
  type HomeFinderFacet,
  type HomeFinderPayload,
  type HomeFinderRoot,
} from "@/lib/home/home-finder-shared";
import db from "@/utils/db";

export {
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

async function facetsForNode(nodeId: string): Promise<HomeFinderFacet[]> {
  const attributes = await fetchAttributesForNode(nodeId);
  const facets: HomeFinderFacet[] = [];

  for (const attribute of attributes) {
    if (!attribute.isFacet || attribute.type === "TEXT") continue;
    if (attribute.dependsOnAttributeId) continue;

    if (attribute.type === "NUMBER" || attribute.type === "YEAR") {
      const subtreeIds = await collectSubtreeIds(nodeId);
      const agg = await db.productSpec.aggregate({
        where: {
          attribute: { key: attribute.key },
          numberValue: { not: null },
          product: {
            status: "PUBLISHED",
            archivedAt: null,
            taxonomyNodeId: { in: subtreeIds },
          },
        },
        _min: { numberValue: true },
        _max: { numberValue: true },
      });
      facets.push({
        key: attribute.key,
        name: attribute.name,
        type: attribute.type,
        unit: attribute.unit,
        options: [],
        minBound:
          agg._min.numberValue != null
            ? Math.floor(agg._min.numberValue)
            : null,
        maxBound:
          agg._max.numberValue != null
            ? Math.ceil(agg._max.numberValue)
            : null,
      });
      continue;
    }

    facets.push({
      key: attribute.key,
      name: attribute.name,
      type: attribute.type,
      unit: attribute.unit,
      options: attribute.options
        .filter((option) => !option.parentOptionId)
        .map((option) => ({ slug: option.slug, label: option.label })),
      minBound: null,
      maxBound: null,
    });
  }

  return facets;
}

async function mapChild(node: TaxonomyTreeNode): Promise<HomeFinderChild> {
  return {
    id: node.id,
    slug: node.slug,
    name: node.name,
    productCount: await subtreePublishedCount(node.id),
    facets: await facetsForNode(node.id),
  };
}

async function mapRoot(node: TaxonomyTreeNode): Promise<HomeFinderRoot> {
  const visibleChildren = node.children.filter(
    (child) => child.isActive && child.showInHomeFilter
  );
  const children =
    visibleChildren.length > 0
      ? await Promise.all(visibleChildren.map(mapChild))
      : [await mapChild(node)];

  return {
    id: node.id,
    slug: node.slug,
    name: node.name,
    productCount: await subtreePublishedCount(node.id),
    children,
  };
}

export async function fetchHomeFinderPayload(): Promise<HomeFinderPayload> {
  const cached = unstable_cache(
    async () => {
      const tree = await fetchTaxonomyTree();
      const rootNodes = tree.filter(
        (node) => node.isActive && node.showInHomeFilter
      );
      const roots = await Promise.all(rootNodes.map(mapRoot));
      return {
        showRootsBlock: roots.length > 1,
        roots,
      };
    },
    ["home-finder-payload"],
    {
      revalidate: CATALOG_CACHE_REVALIDATE_SECONDS,
      tags: [CATALOG_CACHE_TAGS.root, CATALOG_CACHE_TAGS.homeFinder],
    }
  );
  return cached();
}
