import type { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";
import {
  CATALOG_CACHE_REVALIDATE_SECONDS,
  CATALOG_CACHE_TAGS,
} from "@/lib/catalog/cache-tags";
import db from "@/utils/db";
import type { CatalogQuery, CatalogRange } from "@/utils/catalog-query";
import {
  collectSubtreeIds,
  fetchAttributesForNode,
  fetchTaxonomyTree,
  resolveAttributesByKey,
} from "./taxonomy";
import type {
  AttributeTypeName,
  CatalogAttribute,
  TaxonomyTreeNode,
} from "./types";

export type PublicFilterOption = {
  slug: string;
  label: string;
  parentSlug: string | null;
};

export type PublicFilterFacet = {
  key: string;
  name: string;
  type: AttributeTypeName;
  unit: string | null;
  dependsOnKey: string | null;
  options: PublicFilterOption[];
  /** Min value among published products (NUMBER/YEAR). */
  minBound?: number | null;
  /** Max value among published products (NUMBER/YEAR). */
  maxBound?: number | null;
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

function toFacet(
  attribute: CatalogAttribute,
  byId: Map<string, CatalogAttribute>
): PublicFilterFacet | null {
  if (!attribute.isFacet || attribute.type === "TEXT") return null;
  const parent = attribute.dependsOnAttributeId
    ? byId.get(attribute.dependsOnAttributeId)
    : undefined;
  const parentSlugById = new Map(
    (parent?.options ?? []).map((option) => [option.id, option.slug])
  );
  return {
    key: attribute.key,
    name: attribute.name,
    type: attribute.type,
    unit: attribute.unit,
    dependsOnKey: parent?.key ?? null,
    options: attribute.options.map((option) => ({
      slug: option.slug,
      label: option.label,
      parentSlug: option.parentOptionId
        ? (parentSlugById.get(option.parentOptionId) ?? null)
        : null,
    })),
    minBound: null,
    maxBound: null,
  };
}

async function numberBoundsForAttribute(
  attributeKey: string,
  taxonomyNodeIds: string[] | null
): Promise<{ minBound: number | null; maxBound: number | null }> {
  const baseWhere: Prisma.ProductSpecWhereInput = {
    attribute: { key: attributeKey },
    numberValue: { not: null },
    product: {
      status: "PUBLISHED",
      archivedAt: null,
      ...(taxonomyNodeIds?.length
        ? { taxonomyNodeId: { in: taxonomyNodeIds } }
        : {}),
    },
  };

  const [agg, fallback] = await Promise.all([
    db.productSpec.aggregate({
      where: baseWhere,
      _min: { numberValue: true },
      _max: { numberValue: true },
    }),
    taxonomyNodeIds?.length
      ? db.productSpec.aggregate({
          where: {
            attribute: { key: attributeKey },
            numberValue: { not: null },
            product: { status: "PUBLISHED", archivedAt: null },
          },
          _min: { numberValue: true },
          _max: { numberValue: true },
        })
      : Promise.resolve(null),
  ]);

  const min =
    agg._min.numberValue ?? fallback?._min.numberValue ?? null;
  const max =
    agg._max.numberValue ?? fallback?._max.numberValue ?? null;

  return {
    minBound: min != null ? Math.floor(min) : null,
    maxBound: max != null ? Math.ceil(max) : null,
  };
}

export function findFilterNode(
  nodes: PublicFilterNode[],
  slug: string
): PublicFilterNode | null {
  for (const node of nodes) {
    if (node.slug === slug) return node;
    const nested = findFilterNode(node.children, slug);
    if (nested) return nested;
  }
  return null;
}

export function sortPublicFacets(facets: PublicFilterFacet[]) {
  const remaining = [...facets];
  const ordered: PublicFilterFacet[] = [];
  const seen = new Set<string>();
  while (remaining.length > 0) {
    const nextIndex = remaining.findIndex(
      (item) => !item.dependsOnKey || seen.has(item.dependsOnKey)
    );
    const index = nextIndex === -1 ? 0 : nextIndex;
    const [next] = remaining.splice(index, 1);
    ordered.push(next);
    seen.add(next.key);
  }
  return ordered;
}

export function pruneScopedFacetsForTree(
  tree: PublicFilterNode[],
  scopedFacets: Record<string, Record<string, string[]>>
) {
  const next: Record<string, Record<string, string[]>> = {};
  for (const [slug, bucket] of Object.entries(scopedFacets)) {
    const node = findFilterNode(tree, slug);
    next[slug] = pruneDependentFacetValues(node?.facets ?? [], bucket);
  }
  return next;
}

export function pruneDependentFacetValues(
  facets: PublicFilterFacet[],
  bucket: Record<string, string[]>
): Record<string, string[]> {
  const next: Record<string, string[]> = { ...bucket };
  let dirty = true;
  while (dirty) {
    dirty = false;
    for (const facet of facets) {
      if (!facet.dependsOnKey) continue;
      const parentValues = next[facet.dependsOnKey] ?? [];
      if (parentValues.length === 0) continue;
      const allowed = new Set(
        facet.options
          .filter(
            (option) =>
              option.parentSlug != null &&
              parentValues.includes(option.parentSlug)
          )
          .map((option) => option.slug)
      );
      const current = next[facet.key] ?? [];
      const filtered = current.filter((slug) => allowed.has(slug));
      if (filtered.length !== current.length) {
        next[facet.key] = filtered;
        dirty = true;
      }
    }
  }
  return next;
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
      const byId = new Map(attributes.map((item) => [item.id, item]));
      const seen = new Set<string>();
      const subtreeIds = await collectSubtreeIds(node.id);
      for (const attribute of attributes) {
        const facet = toFacet(attribute, byId);
        if (!facet || seen.has(facet.key)) continue;
        seen.add(facet.key);
        if (facet.type === "NUMBER" || facet.type === "YEAR") {
          const bounds = await numberBoundsForAttribute(
            facet.key,
            subtreeIds
          );
          facet.minBound = bounds.minBound;
          facet.maxBound = bounds.maxBound;
        }
        facets.push(facet);
      }
      facets = sortPublicFacets(facets);
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
  const cached = unstable_cache(
    async () => {
      const tree = await fetchTaxonomyTree();
      return { tree: await mapFilterNodes(tree) };
    },
    ["public-filter-schema"],
    {
      revalidate: CATALOG_CACHE_REVALIDATE_SECONDS,
      tags: [CATALOG_CACHE_TAGS.root, CATALOG_CACHE_TAGS.filterSchema],
    }
  );
  return cached();
}

export {
  fetchFilterAvailabilityIndex,
  type FilterAvailabilityIndex,
  type FilterAvailabilityRow,
} from "./filter-availability";

function collectLeafNodes(nodes: PublicFilterNode[]): PublicFilterNode[] {
  const leaves: PublicFilterNode[] = [];
  for (const node of nodes) {
    if (node.children.length === 0) leaves.push(node);
    else leaves.push(...collectLeafNodes(node.children));
  }
  return leaves;
}

async function productWhereForLeaf(
  leafId: string,
  query: Pick<
    CatalogQuery,
    | "search"
    | "featuredOnly"
    | "facets"
    | "ranges"
    | "scopedFacets"
    | "scopedRanges"
    | "folders"
  >,
  leafSlug: string,
  omitFacetKey?: string,
  omitRangeKey?: string
): Promise<Prisma.ProductWhereInput> {
  const subtreeIds = await collectSubtreeIds(leafId);
  const scopedFacets = { ...(query.scopedFacets?.[leafSlug] ?? {}) };
  const scopedRanges = { ...(query.scopedRanges?.[leafSlug] ?? {}) };
  if (omitFacetKey) delete scopedFacets[omitFacetKey];
  if (omitRangeKey) delete scopedRanges[omitRangeKey];

  const and: Prisma.ProductWhereInput[] = [
    { status: "PUBLISHED" },
    { archivedAt: null },
    { taxonomyNodeId: { in: subtreeIds } },
  ];

  if (query.search) {
    and.push({
      OR: [
        { name: { contains: query.search, mode: "insensitive" } },
        { company: { contains: query.search, mode: "insensitive" } },
      ],
    });
  }
  if (query.featuredOnly) and.push({ featured: true });

  and.push(...(await specClausesFor(query.facets ?? {}, query.ranges ?? {})));
  and.push(...(await specClausesFor(scopedFacets, scopedRanges)));

  return { AND: and };
}

/**
 * Narrow facet options / range bounds to values that exist on real products
 * given the rest of the current filter (classic faceted navigation).
 */
export async function enrichFilterSchemaForQuery(
  schema: PublicFilterSchema,
  query: Pick<
    CatalogQuery,
    | "folders"
    | "scopedFacets"
    | "scopedRanges"
    | "search"
    | "featuredOnly"
    | "facets"
    | "ranges"
  >
): Promise<PublicFilterSchema> {
  const leaves = collectLeafNodes(schema.tree);
  if (leaves.length === 0) return schema;

  const slugToId = new Map(
    (
      await db.taxonomyNode.findMany({
        where: { slug: { in: leaves.map((leaf) => leaf.slug) }, isActive: true },
        select: { id: true, slug: true },
      })
    ).map((row) => [row.slug, row.id] as const)
  );

  const enrichedBySlug = new Map<string, PublicFilterFacet[]>();

  await Promise.all(
    leaves.map(async (leaf) => {
      const leafId = slugToId.get(leaf.slug);
      if (!leafId || leaf.facets.length === 0) {
        enrichedBySlug.set(leaf.slug, leaf.facets);
        return;
      }

      const nextFacets: PublicFilterFacet[] = [];
      for (const facet of leaf.facets) {
        if (facet.type === "NUMBER" || facet.type === "YEAR") {
          const where = await productWhereForLeaf(
            leafId,
            query,
            leaf.slug,
            undefined,
            facet.key
          );
          const agg = await db.productSpec.aggregate({
            where: {
              attribute: { key: facet.key },
              numberValue: { not: null },
              product: where,
            },
            _min: { numberValue: true },
            _max: { numberValue: true },
          });
          const min = agg._min.numberValue;
          const max = agg._max.numberValue;
          nextFacets.push({
            ...facet,
            minBound: min != null ? Math.floor(min) : facet.minBound ?? null,
            maxBound: max != null ? Math.ceil(max) : facet.maxBound ?? null,
          });
          continue;
        }

        if (facet.type === "BOOLEAN") {
          const where = await productWhereForLeaf(
            leafId,
            query,
            leaf.slug,
            facet.key
          );
          const count = await db.productSpec.count({
            where: {
              attribute: { key: facet.key },
              product: where,
            },
          });
          nextFacets.push(
            count > 0 ? facet : { ...facet, options: [] }
          );
          continue;
        }

        const where = await productWhereForLeaf(
          leafId,
          query,
          leaf.slug,
          facet.key
        );
        const rows = await db.productSpec.findMany({
          where: {
            attribute: { key: facet.key },
            optionId: { not: null },
            product: where,
          },
          distinct: ["optionId"],
          select: { option: { select: { slug: true } } },
        });
        const allowed = new Set(
          rows
            .map((row) => row.option?.slug)
            .filter((slug): slug is string => Boolean(slug))
        );
        // Keep currently selected values so the UI does not drop mid-click.
        for (const slug of query.scopedFacets?.[leaf.slug]?.[facet.key] ?? []) {
          allowed.add(slug);
        }
        nextFacets.push({
          ...facet,
          options: facet.options.filter((option) => allowed.has(option.slug)),
        });
      }

      enrichedBySlug.set(leaf.slug, sortPublicFacets(nextFacets));
    })
  );

  function mapTree(nodes: PublicFilterNode[]): PublicFilterNode[] {
    return nodes.map((node) => {
      if (node.children.length === 0) {
        return {
          ...node,
          facets: enrichedBySlug.get(node.slug) ?? node.facets,
        };
      }
      return { ...node, children: mapTree(node.children) };
    });
  }

  return { tree: mapTree(schema.tree) };
}

/** Drop scoped facet values that are no longer present after enrichment. */
export function pruneScopedFacetsToSchema(
  tree: PublicFilterNode[],
  scopedFacets: Record<string, Record<string, string[]>>
) {
  const next: Record<string, Record<string, string[]>> = {};
  for (const [slug, bucket] of Object.entries(scopedFacets)) {
    const node = findFilterNode(tree, slug);
    if (!node) continue;
    const byKey = new Map(node.facets.map((facet) => [facet.key, facet]));
    const cleaned: Record<string, string[]> = {};
    for (const [key, values] of Object.entries(bucket)) {
      const facet = byKey.get(key);
      if (!facet) continue;
      if (facet.type === "BOOLEAN") {
        cleaned[key] = values;
        continue;
      }
      const allowed = new Set(facet.options.map((option) => option.slug));
      const filtered = values.filter((value) => allowed.has(value));
      if (filtered.length) cleaned[key] = filtered;
    }
    next[slug] = pruneDependentFacetValues(node.facets, cleaned);
  }
  return next;
}

async function specClausesFor(
  facets: Record<string, string[]>,
  ranges: Record<string, CatalogRange>
): Promise<Prisma.ProductWhereInput[]> {
  const clauses: Prisma.ProductWhereInput[] = [];
  const facetKeys = Object.keys(facets);
  const facetTypes =
    facetKeys.length === 0
      ? []
      : await db.attributeDefinition.findMany({
          where: { key: { in: facetKeys }, isFacet: true },
          select: { key: true, type: true },
          distinct: ["key"],
        });
  const typeByKey = new Map(facetTypes.map((item) => [item.key, item.type]));

  for (const [key, values] of Object.entries(facets)) {
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

  for (const [key, range] of Object.entries(ranges)) {
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

export async function catalogQueryToWhere(
  query: Pick<
    CatalogQuery,
    | "folders"
    | "facets"
    | "ranges"
    | "scopedFacets"
    | "scopedRanges"
    | "featuredOnly"
    | "search"
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

  clauses.push(
    ...(await specClausesFor(query.facets ?? {}, query.ranges ?? {}))
  );

  if (query.folders.length) {
    const nodes = await db.taxonomyNode.findMany({
      where: {
        slug: { in: query.folders },
        isActive: true,
      },
      select: { id: true, slug: true },
    });
    const bySlug = new Map(nodes.map((node) => [node.slug, node.id]));
    const branches: Prisma.ProductWhereInput[] = [];

    for (const slug of query.folders) {
      const id = bySlug.get(slug);
      if (!id) continue;
      const ids = await collectSubtreeIds(id);
      const scoped = await specClausesFor(
        query.scopedFacets?.[slug] ?? {},
        query.scopedRanges?.[slug] ?? {}
      );
      branches.push({
        AND: [{ taxonomyNodeId: { in: ids } }, ...scoped],
      });
    }

    clauses.push(
      branches.length ? { OR: branches } : { id: "__no_folder_match__" }
    );
  }

  return clauses;
}
