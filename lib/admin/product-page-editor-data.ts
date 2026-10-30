import {
  resolveProductPageLayout,
  type ProductPageLayoutResolved,
  type ProductPageLayoutRow,
} from "@/lib/catalog/product-page-layout";
import {
  fetchAttributesForNode,
  fetchTaxonomyNode,
  fetchTaxonomyTree,
  firstTreeNodeId,
} from "@/lib/catalog/taxonomy";
import type { CatalogAttribute, TaxonomyTreeNode } from "@/lib/catalog/types";
import db from "@/utils/db";

export async function resolveDefaultProductPageNodeId(
  tree: TaxonomyTreeNode[]
): Promise<string | null> {
  return firstTreeNodeId(tree) ?? null;
}

export type ProductPageEditorSlot = {
  attributeId: string;
  visible: boolean;
};

export type ProductPageEditorPayload = {
  tree: TaxonomyTreeNode[];
  selectedNodeId: string | null;
  selectedNodeName: string | null;
  attributes: CatalogAttribute[];
  slots: ProductPageEditorSlot[];
  inheritedFromAncestor: boolean;
};

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
      slots: [],
      inheritedFromAncestor: false,
    };
  }

  const attributes = await fetchAttributesForNode(selected.id);
  let layoutRow: ProductPageLayoutRow | null = null;
  let inheritedFromAncestor = false;

  try {
    layoutRow = await db.productPageLayout.findUnique({
      where: { taxonomyNodeId: selected.id },
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

    if (!layoutRow) {
      let parentId = selected.parentId;
      const guard = new Set<string>([selected.id]);
      while (parentId && !guard.has(parentId)) {
        guard.add(parentId);
        const ancestor = await db.productPageLayout.findUnique({
          where: { taxonomyNodeId: parentId },
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
        if (ancestor) {
          layoutRow = ancestor;
          inheritedFromAncestor = true;
          break;
        }
        const parent = await db.taxonomyNode.findUnique({
          where: { id: parentId },
          select: { parentId: true },
        });
        parentId = parent?.parentId ?? null;
      }
    }
  } catch (error) {
    console.error("loadProductPageEditorData layout", error);
    layoutRow = null;
    inheritedFromAncestor = false;
  }

  const resolved: ProductPageLayoutResolved = resolveProductPageLayout(
    layoutRow,
    attributes.map((attr) => ({
      id: attr.id,
      key: attr.key,
      sortOrder: attr.sortOrder,
      name: attr.name,
    }))
  );

  const allowed = new Set(attributes.map((attr) => attr.id));
  const slots = resolved.slots
    .filter((slot) => allowed.has(slot.attributeId))
    .map((slot) => ({
      attributeId: slot.attributeId,
      visible: slot.visible,
    }));

  return {
    tree,
    selectedNodeId: selected.id,
    selectedNodeName: selected.name,
    attributes,
    slots,
    inheritedFromAncestor,
  };
}
