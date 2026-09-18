import type { Prisma } from "@prisma/client";
import db from "@/utils/db";
import type { CatalogQuery } from "@/utils/catalog-query";
import {
  collectSubtreeIds,
  fetchAttributesForNode,
  fetchTaxonomyTree,
  resolveAttributesByKey,
} from "./taxonomy";
import type { AttributeTypeName, TaxonomyTreeNode } from "./types";

export type PublicFilterFacet = {
  key: string;
  name: string;
  type: AttributeTypeName;
  unit: string | null;
  options: { slug: string; label: string }[];
};

export type PublicFilterNode = {
  id: string;
  slug: string;
  name: string;
  children: PublicFilterNode[];
  /** Only on leaf folders (no visible children). */
  facets: PublicFilterFacet[];
};

export type PublicFilterSchema = {
  tree: PublicFilterNode[];
};

function toFacet(attribute: {
  key: string;
  name: string;
  type: AttributeTypeName;
  unit: string | null;
  isFacet: boolean;
  options: { slug: string; label: string }[];
}): PublicFilterFacet | null {
  if (!attribute.isFacet || attribute.type === "TEXT") return null;
  return {
    key: attribute.key,
    name: attribute.name,
    type: attribute.type,
    unit: attribute.unit,
    options: attribute.options.map((option) => ({
      slug: option.slug,
      label: option.label,
    })),
  };
}

async function mapFilterNodes(
  nodes: TaxonomyTreeNode[]
): Promise<PublicFilterNode[]> {
  const result: PublicFilterNode[] = [];

  for (const node of nodes) {
    if (!node.isActive) continue;

    const children = await mapFilterNodes(node.children);

    // Hidden folders do not appear, but their visible descendants hoist up.
    if (!node.showInFilter) {
      result.push(...children);
      continue;
    }

    const isLeaf = children.length === 0;
    let facets: PublicFilterFacet[] = [];
    if (isLeaf) {
      const attributes = resolveAttributesByKey(
        await fetchAttributesForNode(node.id)
      );
      const seen = new Set<string>();
      for (const attribute of attributes) {
        const facet = toFacet(attribute);
        if (!facet || seen.has(facet.key)) continue;
        seen.add(facet.key);
        facets.push(facet);
      }
    }

    result.push({
      id: node.id,
      slug: node.slug,
      name: node.name,
      children,
      facets,
    });
  }

  return result;
}

/** Folders with showInFilter + leaf isFacet fields — source of truth is admin CMS. */
export async function fetchPublicFilterSchema(): Promise<PublicFilterSchema> {
  const tree = await fetchTaxonomyTree();
  return { tree: await mapFilterNodes(tree) };
}

export async function catalogQueryToWhere(
  query: Pick<
    CatalogQuery,
    "folders" | "facets" | "ranges" | "featuredOnly" | "search"
  >
): Promise<Prisma.ProductWhereInput[]> {
  const clauses: Prisma.ProductWhereInput[] = [
    { status: "PUBLISHED" },
    { archivedAt: null },
  ];

  if (query.search) {
    clauses.push({
      OR: [
        { name: { contains: query.search, mode: "insensitive" } },
        { company: { contains: query.search, mode: "insensitive" } },
      ],
    });
  }

  if (query.featuredOnly) {
    clauses.push({ featured: true });
  }

  if (query.folders.length) {
    const nodes = await db.taxonomyNode.findMany({
      where: {
        slug: { in: query.folders },
        isActive: true,
        showInFilter: true,
      },
      select: { id: true },
    });
    const ids = [
      ...new Set(
        (await Promise.all(nodes.map((node) => collectSubtreeIds(node.id)))).flat()
      ),
    ];
    clauses.push(
      ids.length
        ? { taxonomyNodeId: { in: ids } }
        : { id: "__no_folder_match__" }
    );
  }

  const facetKeys = Object.keys(query.facets);
  const facetTypes =
    facetKeys.length === 0
      ? []
      : await db.attributeDefinition.findMany({
          where: { key: { in: facetKeys }, isFacet: true },
          select: { key: true, type: true },
          distinct: ["key"],
        });
  const typeByKey = new Map(facetTypes.map((item) => [item.key, item.type]));

  for (const [key, values] of Object.entries(query.facets)) {
    if (!values.length) continue;
    const type = typeByKey.get(key);
    if (type === "BOOLEAN") {
      const truthy = values.some((value) => value === "1" || value === "true");
      clauses.push({
        specs: {
          some: {
            attribute: { key },
            booleanValue: truthy,
          },
        },
      });
      continue;
    }
    clauses.push({
      specs: {
        some: {
          attribute: { key },
          option: { slug: { in: values } },
        },
      },
    });
  }

  for (const [key, range] of Object.entries(query.ranges)) {
    const numberValue: Prisma.FloatNullableFilter = {};
    if (range.min != null) numberValue.gte = range.min;
    if (range.max != null) numberValue.lte = range.max;
    if (numberValue.gte == null && numberValue.lte == null) continue;
    clauses.push({
      specs: {
        some: {
          attribute: { key },
          numberValue,
        },
      },
    });
  }

  return clauses;
}
