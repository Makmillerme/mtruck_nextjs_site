import {
  CARD_PREVIEW_SUBTITLE_FIELD_MAX,
  resolveCardPreviewLayout,
  slotMaxForSpecsStyle,
  type CardPreviewSpecsStyleId,
} from "@/lib/catalog/card-preview";
import {
  fetchAttributesForNode,
  fetchTaxonomyNode,
  fetchTaxonomyTree,
  firstLeafTreeNodeId,
  isLeafTaxonomyNode,
} from "@/lib/catalog/taxonomy";
import type { CatalogAttribute, TaxonomyTreeNode } from "@/lib/catalog/types";
import db from "@/utils/db";

/** First leaf folder — UI Editor only configures end categories. */
export async function resolveDefaultCardPreviewNodeId(
  tree: TaxonomyTreeNode[]
): Promise<string | null> {
  const withLayout = await db.cardPreviewLayout.findMany({
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

/** Null if missing or not a leaf (parents are not editable here). */
export function resolveLeafEditorNodeId(
  tree: TaxonomyTreeNode[],
  nodeId: string | null | undefined
): string | null {
  if (!nodeId) return null;
  return isLeafTaxonomyNode(tree, nodeId) ? nodeId : null;
}

export type CardPreviewEditorPayload = {
  tree: TaxonomyTreeNode[];
  selectedNodeId: string | null;
  selectedNodeName: string | null;
  attributes: CatalogAttribute[];
  showName: boolean;
  showPrice: boolean;
  showStatus: boolean;
  showSubtitle: boolean;
  showSpecs: boolean;
  specsStyle: CardPreviewSpecsStyleId;
  specsGridCount: number;
  slotAttributeIds: string[];
  subtitleAttributeIds: string[];
  slotMax: number;
};

export async function loadCardPreviewEditorData(
  nodeId?: string | null
): Promise<CardPreviewEditorPayload> {
  const tree = await fetchTaxonomyTree();
  const selected = nodeId ? await fetchTaxonomyNode(nodeId) : null;
  if (!selected) {
    return {
      tree,
      selectedNodeId: null,
      selectedNodeName: null,
      attributes: [],
      showName: true,
      showPrice: true,
      showStatus: true,
      showSubtitle: true,
      showSpecs: true,
      specsStyle: "GRID",
      specsGridCount: 4,
      slotAttributeIds: [],
      subtitleAttributeIds: [],
      slotMax: slotMaxForSpecsStyle("GRID", 4),
    };
  }

  const attributes = await fetchAttributesForNode(selected.id);
  const layout = await db.cardPreviewLayout.findUnique({
    where: { taxonomyNodeId: selected.id },
    include: {
      taxonomyNode: { select: { name: true } },
      slots: {
        orderBy: { sortOrder: "asc" },
        select: {
          attributeId: true,
          sortOrder: true,
          attribute: { select: { key: true } },
        },
      },
      subtitleSlots: {
        orderBy: { sortOrder: "asc" },
        select: {
          attributeId: true,
          sortOrder: true,
          attribute: { select: { key: true } },
        },
      },
    },
  });

  const resolved = resolveCardPreviewLayout(layout);
  const max = slotMaxForSpecsStyle(
    resolved.specsStyle,
    resolved.specsGridCount
  );
  // Full ordered list for the editor; display limit applies only on the card.
  let slotAttributeIds = layout
    ? [...layout.slots]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((slot) => slot.attributeId)
    : [];

  slotAttributeIds = slotAttributeIds.filter((id) =>
    attributes.some((attr) => attr.id === id)
  );

  let subtitleAttributeIds = layout
    ? [...layout.subtitleSlots]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((slot) => slot.attributeId)
        .slice(0, CARD_PREVIEW_SUBTITLE_FIELD_MAX)
    : [];

  subtitleAttributeIds = subtitleAttributeIds.filter((id) =>
    attributes.some((attr) => attr.id === id)
  );

  return {
    tree,
    selectedNodeId: selected.id,
    selectedNodeName: selected.name,
    attributes,
    showName: resolved.showName,
    showPrice: resolved.showPrice,
    showStatus: resolved.showStatus,
    showSubtitle: resolved.showSubtitle,
    showSpecs: resolved.showSpecs,
    specsStyle: resolved.specsStyle,
    specsGridCount: resolved.specsGridCount,
    slotAttributeIds,
    subtitleAttributeIds,
    slotMax: max,
  };
}
