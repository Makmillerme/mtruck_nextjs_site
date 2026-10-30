import type { PrismaClient } from "@prisma/client";

export type ProductPageSpecSlotResolved = {
  attributeId: string;
  attributeKey: string;
  sortOrder: number;
  visible: boolean;
};

export type ProductPageLayoutResolved = {
  slots: ProductPageSpecSlotResolved[];
};

export type ProductPageLayoutRow = {
  slots: {
    sortOrder: number;
    visible: boolean;
    attributeId: string;
    attribute: { key: string };
  }[];
};

export type AvailableAttributeForLayout = {
  id: string;
  key: string;
  sortOrder?: number;
  name?: string;
};

/**
 * Merge saved slots with currently available attributes.
 * Missing attrs append at the end, visible: true.
 * No layout → all attrs visible in model order.
 */
export function resolveProductPageLayout(
  row: ProductPageLayoutRow | null | undefined,
  available: AvailableAttributeForLayout[]
): ProductPageLayoutResolved {
  const sortedAvailable = [...available].sort(
    (a, b) =>
      (a.sortOrder ?? 0) - (b.sortOrder ?? 0) ||
      (a.name ?? a.key).localeCompare(b.name ?? b.key, "uk")
  );

  if (!row || row.slots.length === 0) {
    return {
      slots: sortedAvailable.map((attr, index) => ({
        attributeId: attr.id,
        attributeKey: attr.key,
        sortOrder: index,
        visible: true,
      })),
    };
  }

  const byId = new Map(sortedAvailable.map((attr) => [attr.id, attr] as const));
  const used = new Set<string>();
  const slots: ProductPageSpecSlotResolved[] = [];

  for (const slot of [...row.slots].sort((a, b) => a.sortOrder - b.sortOrder)) {
    const attr = byId.get(slot.attributeId);
    if (!attr) continue;
    used.add(attr.id);
    slots.push({
      attributeId: attr.id,
      attributeKey: attr.key,
      sortOrder: slots.length,
      visible: slot.visible,
    });
  }

  for (const attr of sortedAvailable) {
    if (used.has(attr.id)) continue;
    slots.push({
      attributeId: attr.id,
      attributeKey: attr.key,
      sortOrder: slots.length,
      visible: true,
    });
  }

  return { slots };
}

export async function fetchProductPageLayoutsByNodeIds(
  prisma: PrismaClient,
  nodeIds: string[]
) {
  const unique = [...new Set(nodeIds.filter(Boolean))];
  if (unique.length === 0) {
    return new Map<string, ProductPageLayoutRow>();
  }

  const nodes = await prisma.taxonomyNode.findMany({
    select: { id: true, parentId: true },
  });
  const parentById = new Map(nodes.map((node) => [node.id, node.parentId]));

  function ancestorChain(nodeId: string): string[] {
    const chain: string[] = [];
    let current: string | null = nodeId;
    const guard = new Set<string>();
    while (current && !guard.has(current)) {
      chain.push(current);
      guard.add(current);
      current = parentById.get(current) ?? null;
    }
    return chain;
  }

  const relatedIds = [
    ...new Set(unique.flatMap((id) => ancestorChain(id))),
  ];

  const rows = await prisma.productPageLayout.findMany({
    where: { taxonomyNodeId: { in: relatedIds } },
    include: {
      slots: {
        orderBy: { sortOrder: "asc" },
        select: {
          sortOrder: true,
          visible: true,
          attributeId: true,
          attribute: { select: { key: true } },
        },
      },
    },
  });

  const byNodeId = new Map(
    rows.map((row) => [row.taxonomyNodeId, row as ProductPageLayoutRow] as const)
  );

  const map = new Map<string, ProductPageLayoutRow>();
  for (const nodeId of unique) {
    for (const id of ancestorChain(nodeId)) {
      const layout = byNodeId.get(id);
      if (layout) {
        map.set(nodeId, layout);
        break;
      }
    }
  }
  return map;
}
