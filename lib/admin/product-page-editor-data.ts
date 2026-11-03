import {
  productPageLayoutInclude,
  resolveProductPageLayout,
  type ProductPageLayoutResolved,
  type ProductPageLayoutRow,
  type ProductPageTabKindName,
  type ProductPageSystemSourceName,
} from "@/lib/catalog/product-page-layout";
import {
  fetchAttributesForNode,
  fetchTaxonomyNode,
  fetchTaxonomyTree,
  firstLeafTreeNodeId,
} from "@/lib/catalog/taxonomy";
import type { CatalogAttribute, TaxonomyTreeNode } from "@/lib/catalog/types";
import db from "@/utils/db";

export async function resolveDefaultProductPageNodeId(
  tree: TaxonomyTreeNode[]
): Promise<string | null> {
  const withLayout = await db.productPageLayout.findMany({
    select: { taxonomyNodeId: true },
  });
  const configured = new Set(withLayout.map((row) => row.taxonomyNodeId));
  const preferConfigured = (nodes: TaxonomyTreeNode[]): string | undefined => {
    for (const node of nodes) {
      if (node.children.length === 0) {
        if (configured.has(node.id)) return node.id;
      } else {
        const nested = preferConfigured(node.children);
        if (nested) return nested;
      }
    }
    return undefined;
  };
  return preferConfigured(tree) ?? firstLeafTreeNodeId(tree) ?? null;
}

export type ProductPageEditorKeyFactSlot = {
  attributeId: string;
  visible: boolean;
};

export type ProductPageEditorTabSlot = {
  attributeId: string | null;
  systemSource: ProductPageSystemSourceName | null;
  visible: boolean;
};

export type ProductPageEditorTab = {
  id: string;
  name: string;
  kind: ProductPageTabKindName;
  slots: ProductPageEditorTabSlot[];
};

export type ProductPageEditorPayload = {
  tree: TaxonomyTreeNode[];
  selectedNodeId: string | null;
  selectedNodeName: string | null;
  attributes: CatalogAttribute[];
  keyFactsMax: number;
  keyFactSlots: ProductPageEditorKeyFactSlot[];
  tabs: ProductPageEditorTab[];
  inheritedFromAncestor: boolean;
};

async function loadLayoutRowForNode(
  nodeId: string,
  parentId: string | null
): Promise<{ row: ProductPageLayoutRow | null; inherited: boolean }> {
  try {
    const own = await db.productPageLayout.findUnique({
      where: { taxonomyNodeId: nodeId },
      include: productPageLayoutInclude,
    });
    if (own) {
      return { row: own as ProductPageLayoutRow, inherited: false };
    }

    let currentParent = parentId;
    const guard = new Set<string>([nodeId]);
    while (currentParent && !guard.has(currentParent)) {
      guard.add(currentParent);
      const ancestor = await db.productPageLayout.findUnique({
        where: { taxonomyNodeId: currentParent },
        include: productPageLayoutInclude,
      });
      if (ancestor) {
        return { row: ancestor as ProductPageLayoutRow, inherited: true };
      }
      const parent = await db.taxonomyNode.findUnique({
        where: { id: currentParent },
        select: { parentId: true },
      });
      currentParent = parent?.parentId ?? null;
    }
    return { row: null, inherited: false };
  } catch (error) {
    // Stale Prisma client (missing Tab/KeyFact models) used to hide here → empty editor.
    console.error("loadProductPageEditorData layout", error);
    throw error;
  }
}

export async function loadProductPageEditorData(
  nodeId?: string | null
): Promise<ProductPageEditorPayload> {
  const tree = await fetchTaxonomyTree();
  const selected = nodeId ? await fetchTaxonomyNode(nodeId) : null;
  if (!selected) {
    return {
      tree,
      selectedNodeId: null,
      selectedNodeName: null,
      attributes: [],
      keyFactsMax: 6,
      keyFactSlots: [],
      tabs: [],
      inheritedFromAncestor: false,
    };
  }

  // Path only (folder + ancestors). Layout on a bare root stays empty until
  // fields exist on that path — do not hoist descendant fields.
  const attributes = await fetchAttributesForNode(selected.id);
  const { row: layoutRow, inherited: inheritedFromAncestor } =
    await loadLayoutRowForNode(selected.id, selected.parentId);

  const resolved: ProductPageLayoutResolved = resolveProductPageLayout(
    layoutRow,
    attributes.map((attr) => ({
      id: attr.id,
      key: attr.key,
      sortOrder: attr.sortOrder,
      name: attr.name,
      type: attr.type,
      textInput: attr.textInput,
    }))
  );

  const allowed = new Set(attributes.map((attr) => attr.id));

  return {
    tree,
    selectedNodeId: selected.id,
    selectedNodeName: selected.name,
    attributes,
    keyFactsMax: resolved.keyFactsMax,
    keyFactSlots: resolved.keyFactSlots
      .filter((slot) => allowed.has(slot.attributeId))
      .map((slot) => ({
        attributeId: slot.attributeId,
        visible: slot.visible,
      })),
    tabs: resolved.tabs.map((tab) => ({
      id: tab.id,
      name: tab.name,
      kind: tab.kind,
      slots:
        tab.kind === "TEXT" && tab.slots.length === 0
          ? [
              {
                attributeId: null,
                systemSource: "DESCRIPTION" as const,
                visible: true,
              },
            ]
          : tab.slots.map((slot) => ({
              attributeId: slot.attributeId,
              systemSource: slot.systemSource,
              visible: slot.visible,
            })),
    })),
    inheritedFromAncestor,
  };
}
