import { cache } from "react";
import db from "@/utils/db";
import type {
  CatalogAttribute,
  CatalogDisplayGroup,
  SubtreeStats,
  TaxonomyNodeRow,
  TaxonomyTreeNode,
} from "./types";

/** Root / type / subtype — depth indices 0, 1, 2. */
export const TAXONOMY_MAX_DEPTH = 3;

/** Deepest parent that may still receive a child (subtype cannot). */
export const TAXONOMY_MAX_PARENT_DEPTH = TAXONOMY_MAX_DEPTH - 1;

/** Walk parents until root; root depth = 0. */
export async function getTaxonomyNodeDepth(nodeId: string): Promise<number> {
  let depth = 0;
  let currentId: string | null = nodeId;
  const seen = new Set<string>();
  while (currentId) {
    if (seen.has(currentId)) return depth;
    seen.add(currentId);
    const node: { parentId: string | null } | null =
      await db.taxonomyNode.findUnique({
        where: { id: currentId },
        select: { parentId: true },
      });
    if (!node?.parentId) return depth;
    depth += 1;
    currentId = node.parentId;
    if (depth > TAXONOMY_MAX_DEPTH + 8) return depth;
  }
  return depth;
}

/** Nodes whose depth index is past the allowed max (depth >= TAXONOMY_MAX_DEPTH). */
export async function findTaxonomyNodesBeyondMaxDepth(): Promise<
  Array<{ id: string; name: string; slug: string; depth: number }>
> {
  const nodes = await db.taxonomyNode.findMany({
    select: { id: true, name: true, slug: true, parentId: true },
  });
  const parentById = new Map<string, string | null>(
    nodes.map((n) => [n.id, n.parentId])
  );
  const depthOf = (id: string): number => {
    let depth = 0;
    let current: string | null = id;
    const seen = new Set<string>();
    while (current) {
      if (seen.has(current)) break;
      seen.add(current);
      const parentId: string | null = parentById.get(current) ?? null;
      if (!parentId) break;
      depth += 1;
      current = parentId;
      if (depth > TAXONOMY_MAX_DEPTH + 8) break;
    }
    return depth;
  };
  return nodes
    .map((n) => ({ ...n, depth: depthOf(n.id) }))
    .filter((n) => n.depth >= TAXONOMY_MAX_DEPTH);
}

/**
 * Root `productsAreUnique` for the branch containing `taxonomyNodeId`.
 * Missing node / no folder → false (qty allowed).
 */
export async function resolveProductsAreUnique(
  taxonomyNodeId: string | null | undefined
): Promise<boolean> {
  if (!taxonomyNodeId) return false;
  let currentId: string | null = taxonomyNodeId;
  const seen = new Set<string>();
  while (currentId) {
    if (seen.has(currentId)) return false;
    seen.add(currentId);
    const node: {
      parentId: string | null;
      productsAreUnique: boolean;
    } | null = await db.taxonomyNode.findUnique({
      where: { id: currentId },
      select: { parentId: true, productsAreUnique: true },
    });
    if (!node) return false;
    if (!node.parentId) return Boolean(node.productsAreUnique);
    currentId = node.parentId;
  }
  return false;
}

/** Batch resolve uniqueness for many folder ids (product.taxonomyNodeId). */
export async function resolveProductsAreUniqueByNodeIds(
  nodeIds: string[]
): Promise<Map<string, boolean>> {
  const unique = [...new Set(nodeIds.filter(Boolean))];
  const result = new Map<string, boolean>();
  if (unique.length === 0) return result;
  await Promise.all(
    unique.map(async (id) => {
      result.set(id, await resolveProductsAreUnique(id));
    })
  );
  return result;
}

export function buildTaxonomyTree(
  nodes: TaxonomyNodeRow[],
  productCountByNode: Map<string, number>,
  attributeCountByNode: Map<string, number> = new Map()
): TaxonomyTreeNode[] {
  const byParent = new Map<string | null, TaxonomyNodeRow[]>();
  for (const node of nodes) {
    const key = node.parentId;
    const list = byParent.get(key) ?? [];
    list.push(node);
    byParent.set(key, list);
  }

  const walk = (parentId: string | null): TaxonomyTreeNode[] => {
    const children = byParent.get(parentId) ?? [];
    return children
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "uk"))
      .map((node) => {
        const branch = walk(node.id);
        const productCount = productCountByNode.get(node.id) ?? 0;
        const attributeCount = attributeCountByNode.get(node.id) ?? 0;
        return {
          ...node,
          children: branch,
          productCount,
          attributeCount,
          subtreeProductCount: branch.reduce(
            (total, child) => total + child.subtreeProductCount,
            productCount
          ),
          subtreeAttributeCount: branch.reduce(
            (total, child) => total + child.subtreeAttributeCount,
            attributeCount
          ),
          descendantCount: branch.reduce(
            (total, child) => total + child.descendantCount + 1,
            0
          ),
        };
      });
  };

  return walk(null);
}

export async function fetchTaxonomyNodes() {
  return db.taxonomyNode.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      parentId: true,
      slug: true,
      name: true,
      sortOrder: true,
      isActive: true,
      showInFilter: true,
      showInHomeFilter: true,
      productsAreUnique: true,
    },
  });
}

export async function fetchProductCountByNode() {
  const rows = await db.product.groupBy({
    by: ["taxonomyNodeId"],
    _count: { _all: true },
    where: { taxonomyNodeId: { not: null } },
  });
  return new Map(
    rows
      .filter((row) => row.taxonomyNodeId)
      .map((row) => [row.taxonomyNodeId as string, row._count._all])
  );
}

export async function fetchAttributeCountByNode() {
  const rows = await db.attributeDefinition.groupBy({
    by: ["taxonomyNodeId"],
    _count: { _all: true },
  });
  return new Map(rows.map((row) => [row.taxonomyNodeId, row._count._all]));
}

/** Request-scoped memo — layout + page share one tree fetch. */
export const fetchTaxonomyTree = cache(async () => {
  const [nodes, productCounts, attributeCounts] = await Promise.all([
    fetchTaxonomyNodes(),
    fetchProductCountByNode(),
    fetchAttributeCountByNode(),
  ]);
  return buildTaxonomyTree(nodes, productCounts, attributeCounts);
});

export function flattenTaxonomyTree(
  tree: TaxonomyTreeNode[],
  depth = 0
): Array<TaxonomyTreeNode & { depth: number }> {
  return tree.flatMap((node) => [
    { ...node, depth },
    ...flattenTaxonomyTree(node.children, depth + 1),
  ]);
}

/** Collect a node id and all descendant ids from a taxonomy tree. */
export function collectSubtreeNodeIds(
  tree: TaxonomyTreeNode[],
  rootId: string
): Set<string> {
  const ids = new Set<string>();
  const walk = (nodes: TaxonomyTreeNode[]): boolean => {
    for (const node of nodes) {
      if (node.id === rootId) {
        const take = (n: TaxonomyTreeNode) => {
          ids.add(n.id);
          for (const child of n.children) take(child);
        };
        take(node);
        return true;
      }
      if (walk(node.children)) return true;
    }
    return false;
  };
  walk(tree);
  return ids;
}

/** Find a node anywhere in the tree. */
export function findNodeInTree(
  tree: TaxonomyTreeNode[],
  nodeId: string
): TaxonomyTreeNode | null {
  for (const node of tree) {
    if (node.id === nodeId) return node;
    const nested = findNodeInTree(node.children, nodeId);
    if (nested) return nested;
  }
  return null;
}

/** Direct children of a root (scoped folder picker under ?root=). */
export function getRootChildren(
  tree: TaxonomyTreeNode[],
  rootId: string
): TaxonomyTreeNode[] {
  const root = tree.find((node) => node.id === rootId);
  return root?.children ?? [];
}

/** First node in depth-first preorder (for default folder under a root). */
export function firstTreeNodeId(nodes: TaxonomyTreeNode[]): string | undefined {
  if (nodes.length === 0) return undefined;
  return nodes[0].id;
}

/** True if the node has no children in the tree. */
export function isLeafTaxonomyNode(
  tree: TaxonomyTreeNode[],
  nodeId: string
): boolean {
  const node = findNodeInTree(tree, nodeId);
  return Boolean(node && node.children.length === 0);
}

/** First leaf (no children) in depth-first preorder. */
export function firstLeafTreeNodeId(
  nodes: TaxonomyTreeNode[]
): string | undefined {
  for (const node of nodes) {
    if (node.children.length === 0) return node.id;
    const nested = firstLeafTreeNodeId(node.children);
    if (nested) return nested;
  }
  return undefined;
}

/** True if the folder has no child taxonomy nodes (end category). */
export async function isLeafTaxonomyNodeId(nodeId: string) {
  const children = await db.taxonomyNode.count({
    where: { parentId: nodeId },
  });
  return children === 0;
}

/** True if nodeId is the root or any descendant of rootId. */
export function isNodeInSubtree(
  tree: TaxonomyTreeNode[],
  rootId: string,
  nodeId: string
): boolean {
  return collectSubtreeNodeIds(tree, rootId).has(nodeId);
}

/** Map taxonomy tree into CascadeSelect items. */
export function taxonomyToCascadeItems(
  nodes: TaxonomyTreeNode[]
): { id: string; label: string; children?: ReturnType<typeof taxonomyToCascadeItems> }[] {
  return nodes.map((node) => ({
    id: node.id,
    label: node.name,
    children: node.children.length
      ? taxonomyToCascadeItems(node.children)
      : undefined,
  }));
}

export async function fetchTaxonomyNode(id: string) {
  return db.taxonomyNode.findUnique({
    where: { id },
  });
}

export async function getPathNodes(nodeId: string) {
  const path: TaxonomyNodeRow[] = [];
  let current = await db.taxonomyNode.findUnique({
    where: { id: nodeId },
    select: {
      id: true,
      parentId: true,
      slug: true,
      name: true,
      sortOrder: true,
      isActive: true,
      showInFilter: true,
      showInHomeFilter: true,
      productsAreUnique: true,
    },
  });
  while (current) {
    path.unshift(current);
    if (!current.parentId) break;
    current = await db.taxonomyNode.findUnique({
      where: { id: current.parentId },
      select: {
        id: true,
        parentId: true,
        slug: true,
        name: true,
        sortOrder: true,
        isActive: true,
        showInFilter: true,
        showInHomeFilter: true,
        productsAreUnique: true,
      },
    });
  }
  return path;
}

function mapAttribute(
  def: {
    id: string;
    taxonomyNodeId: string;
    key: string;
    name: string;
    type: CatalogAttribute["type"];
    dependsOnAttributeId: string | null;
    dependsOn: { id: string; name: string; key: string } | null;
    isRequired: boolean;
    isFacet: boolean;
    showInHomeFilter: boolean;
    unit: string | null;
    sheetWidth: CatalogAttribute["sheetWidth"];
    textInput: CatalogAttribute["textInput"];
    sortOrder: number;
    taxonomyNode: { id: string; name: string };
    options: {
      id: string;
      attributeId: string;
      parentOptionId: string | null;
      label: string;
      slug: string;
      sortOrder: number;
    }[];
  },
  selectedNodeId: string
): CatalogAttribute {
  return {
    id: def.id,
    taxonomyNodeId: def.taxonomyNodeId,
    key: def.key,
    name: def.name,
    type: def.type,
    dependsOnAttributeId: def.dependsOnAttributeId,
    dependsOn: def.dependsOn,
    isRequired: def.isRequired,
    isFacet: def.isFacet,
    showInHomeFilter: def.showInHomeFilter,
    unit: def.unit,
    sheetWidth: def.sheetWidth,
    textInput: def.textInput ?? "LINE",
    sortOrder: def.sortOrder,
    source: def.taxonomyNode,
    inherited: def.taxonomyNodeId !== selectedNodeId,
    options: def.options,
  };
}

const attributeInclude = {
  dependsOn: { select: { id: true, name: true, key: true } },
  taxonomyNode: { select: { id: true, name: true } },
  options: { orderBy: [{ sortOrder: "asc" as const }, { label: "asc" as const }] },
};

export async function fetchAttributesForNode(nodeId: string) {
  const path = await getPathNodes(nodeId);
  const pathIds = path.map((node) => node.id);
  const defs = await db.attributeDefinition.findMany({
    where: { taxonomyNodeId: { in: pathIds } },
    include: attributeInclude,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  const depth = new Map(pathIds.map((id, index) => [id, index]));
  return defs
    .slice()
    .sort(
      (a, b) =>
        (depth.get(a.taxonomyNodeId) ?? 0) - (depth.get(b.taxonomyNodeId) ?? 0) ||
        a.sortOrder - b.sortOrder ||
        a.name.localeCompare(b.name, "uk")
    )
    .map((def) => mapAttribute(def, nodeId));
}

/** All attributes under root folders (main catalog trees), unique by key. */
export async function fetchRootCatalogAttributes() {
  const roots = await db.taxonomyNode.findMany({
    where: { parentId: null, isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true },
  });
  if (roots.length === 0) return [] as CatalogAttribute[];
  const subtreeIds = (
    await Promise.all(roots.map((root) => collectSubtreeIds(root.id)))
  ).flat();
  const uniqueIds = [...new Set(subtreeIds)];
  const defs = await db.attributeDefinition.findMany({
    where: { taxonomyNodeId: { in: uniqueIds } },
    include: attributeInclude,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return resolveAttributesByKey(
    defs.map((def) => mapAttribute(def, def.taxonomyNodeId))
  );
}

/**
 * Closest folder wins when the same key exists on parent and child.
 * Order: senior folder first (input path order), then each folder's sortOrder.
 */
export function resolveAttributesByKey(attributes: CatalogAttribute[]) {
  const byKey = new Map<string, CatalogAttribute>();
  for (const attribute of attributes) {
    byKey.set(attribute.key, attribute);
  }
  const folderRank = new Map<string, number>();
  for (const attribute of attributes) {
    if (!folderRank.has(attribute.taxonomyNodeId)) {
      folderRank.set(attribute.taxonomyNodeId, folderRank.size);
    }
  }
  return [...byKey.values()].sort((a, b) => {
    const folder =
      (folderRank.get(a.taxonomyNodeId) ?? 0) -
      (folderRank.get(b.taxonomyNodeId) ?? 0);
    if (folder !== 0) return folder;
    return a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "uk");
  });
}

export async function fetchDisplayGroupsForNode(nodeId: string) {
  const path = await getPathNodes(nodeId);
  const pathIds = path.map((node) => node.id);
  const groups = await db.displayGroup.findMany({
    where: { taxonomyNodeId: { in: pathIds } },
    include: {
      taxonomyNode: { select: { id: true, name: true } },
      members: {
        orderBy: [{ sortOrder: "asc" }],
        include: {
          attribute: {
            select: {
              id: true,
              key: true,
              name: true,
              type: true,
              unit: true,
            },
          },
        },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  const depth = new Map(pathIds.map((id, index) => [id, index]));
  return groups
    .slice()
    .sort(
      (a, b) =>
        (depth.get(a.taxonomyNodeId) ?? 0) - (depth.get(b.taxonomyNodeId) ?? 0) ||
        a.sortOrder - b.sortOrder ||
        a.name.localeCompare(b.name, "uk")
    )
    .map(
      (group): CatalogDisplayGroup => ({
        id: group.id,
        taxonomyNodeId: group.taxonomyNodeId,
        key: group.key,
        name: group.name,
        separator: group.separator,
        sortOrder: group.sortOrder,
        writesProductName: group.writesProductName,
        targetAttributeId: group.targetAttributeId ?? null,
        source: group.taxonomyNode,
        inherited: group.taxonomyNodeId !== nodeId,
        members: group.members.map((member) => ({
          id: member.id,
          attributeId: member.attributeId,
          sortOrder: member.sortOrder,
          attribute: {
            id: member.attribute.id,
            key: member.attribute.key,
            name: member.attribute.name,
            type: member.attribute.type,
            unit: member.attribute.unit,
          },
        })),
      })
    );
}

/** Closest folder wins when the same key exists on parent and child. */
export function resolveDisplayGroupsByKey(groups: CatalogDisplayGroup[]) {
  const byKey = new Map<string, CatalogDisplayGroup>();
  for (const group of groups) {
    byKey.set(group.key, group);
  }
  return [...byKey.values()].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "uk")
  );
}

export async function countNodeChildren(nodeId: string) {
  return db.taxonomyNode.count({ where: { parentId: nodeId } });
}

export async function countNodeProducts(nodeId: string) {
  return db.product.count({ where: { taxonomyNodeId: nodeId } });
}

/** Node id plus every descendant id, so deletes and stats cover the whole branch. */
export async function collectSubtreeIds(nodeId: string) {
  const nodes = await fetchTaxonomyNodes();
  const byParent = new Map<string | null, string[]>();
  for (const node of nodes) {
    const siblings = byParent.get(node.parentId) ?? [];
    siblings.push(node.id);
    byParent.set(node.parentId, siblings);
  }

  const ids: string[] = [];
  const queue = [nodeId];
  while (queue.length > 0) {
    const current = queue.shift() as string;
    ids.push(current);
    queue.push(...(byParent.get(current) ?? []));
  }
  return ids;
}

export async function getSubtreeStats(nodeId: string): Promise<SubtreeStats> {
  const ids = await collectSubtreeIds(nodeId);
  const [attributeCount, productCount] = await Promise.all([
    db.attributeDefinition.count({ where: { taxonomyNodeId: { in: ids } } }),
    db.product.count({ where: { taxonomyNodeId: { in: ids } } }),
  ]);
  return {
    descendantCount: ids.length - 1,
    attributeCount,
    productCount,
  };
}

export async function fetchSiblingNodes(parentId: string | null) {
  return db.taxonomyNode.findMany({
    where: { parentId },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, sortOrder: true },
  });
}
