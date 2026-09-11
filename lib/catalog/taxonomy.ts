import db from "@/utils/db";
import type {
  CatalogAttribute,
  SubtreeStats,
  TaxonomyNodeRow,
  TaxonomyTreeNode,
} from "./types";

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

export async function fetchTaxonomyTree() {
  const [nodes, productCounts, attributeCounts] = await Promise.all([
    fetchTaxonomyNodes(),
    fetchProductCountByNode(),
    fetchAttributeCountByNode(),
  ]);
  return buildTaxonomyTree(nodes, productCounts, attributeCounts);
}

export function flattenTaxonomyTree(
  tree: TaxonomyTreeNode[],
  depth = 0
): Array<TaxonomyTreeNode & { depth: number }> {
  return tree.flatMap((node) => [
    { ...node, depth },
    ...flattenTaxonomyTree(node.children, depth + 1),
  ]);
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
    isIdentity: boolean;
    unit: string | null;
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
    isIdentity: def.isIdentity,
    unit: def.unit,
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

/** Closest folder wins when the same key exists on parent and child. */
export function resolveAttributesByKey(attributes: CatalogAttribute[]) {
  const byKey = new Map<string, CatalogAttribute>();
  for (const attribute of attributes) {
    byKey.set(attribute.key, attribute);
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
