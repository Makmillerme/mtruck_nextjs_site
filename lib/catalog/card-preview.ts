import type {
  CardPreviewCategorySource,
  CardPreviewSpecsStyle,
  PrismaClient,
} from "@prisma/client";

/** Practical upper bound for TAGS (treated as unlimited in UI). */
export const CARD_PREVIEW_SLOT_MAX = 48;
export const CARD_PREVIEW_SUBTITLE_FIELD_MAX = 2;
export const CARD_PREVIEW_GRID_COUNT_MIN = 1;
export const CARD_PREVIEW_GRID_COUNT_MAX = 8;

export type CardPreviewSpecsStyleId = CardPreviewSpecsStyle;
export type CardPreviewCategorySourceId = CardPreviewCategorySource;

export const CARD_PREVIEW_SPECS_STYLES: CardPreviewSpecsStyleId[] = [
  "GRID",
  "TAGS",
];

export const CARD_PREVIEW_GRID_COUNTS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export const CARD_PREVIEW_CATEGORY_SOURCES: CardPreviewCategorySourceId[] = [
  "LAYOUT_FOLDER",
  "PRODUCT_FOLDER",
];

export function clampSpecsGridCount(count: number | null | undefined): number {
  if (count == null || Number.isNaN(count)) return 4;
  return Math.min(
    CARD_PREVIEW_GRID_COUNT_MAX,
    Math.max(CARD_PREVIEW_GRID_COUNT_MIN, Math.round(count))
  );
}

export function slotMaxForSpecsStyle(
  style: CardPreviewSpecsStyleId,
  gridCount: number = 4
): number {
  if (style === "GRID") return clampSpecsGridCount(gridCount);
  return CARD_PREVIEW_SLOT_MAX;
}

export function isTagsSpecsStyle(style: CardPreviewSpecsStyleId): boolean {
  return style === "TAGS";
}

/** CSS grid classes for the specs icon grid (not TAGS). */
export function specsGridClassName(
  count: number,
  isList: boolean
): string {
  const n = clampSpecsGridCount(count);
  if (isList) {
    if (n <= 4) return "grid grid-cols-2 sm:grid-cols-4";
    if (n <= 6) return "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6";
    return "grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8";
  }
  if (n <= 4) return "grid grid-cols-2";
  return "grid grid-cols-2 sm:grid-cols-3";
}

export type CardPreviewLayoutResolved = {
  showName: boolean;
  showPrice: boolean;
  showStatus: boolean;
  showSubtitle: boolean;
  showSpecs: boolean;
  specsStyle: CardPreviewSpecsStyleId;
  specsGridCount: number;
  categorySource: CardPreviewCategorySourceId;
  /** Name of the folder that owns this layout (for LAYOUT_FOLDER source). */
  layoutFolderName: string | null;
  /** Ordered attribute keys for the specs block */
  slotKeys: string[];
  /** Extra subtitle field keys (category is always appended; max 2). */
  subtitleKeys: string[];
};

export const FALLBACK_CARD_PREVIEW_LAYOUT: CardPreviewLayoutResolved = {
  showName: true,
  showPrice: true,
  showStatus: true,
  showSubtitle: true,
  showSpecs: true,
  specsStyle: "GRID",
  specsGridCount: 4,
  categorySource: "PRODUCT_FOLDER",
  layoutFolderName: null,
  slotKeys: [],
  subtitleKeys: [],
};

export type CardPreviewLayoutRow = {
  showName: boolean;
  showPrice: boolean;
  showStatus: boolean;
  showSubtitle: boolean;
  showSpecs?: boolean | null;
  specsStyle?: CardPreviewSpecsStyleId | string | null;
  specsGridCount?: number | null;
  categorySource?: CardPreviewCategorySourceId | null;
  taxonomyNode?: { name: string } | null;
  slots: { sortOrder: number; attribute: { key: string } }[];
  subtitleSlots?: { sortOrder: number; attribute: { key: string } }[];
};

function normalizeSpecsStyle(
  raw: string | null | undefined
): CardPreviewSpecsStyleId {
  if (raw === "TAGS") return "TAGS";
  return "GRID";
}

function gridCountFromLegacyStyle(
  raw: string | null | undefined,
  stored: number | null | undefined
): number {
  if (raw === "GRID_5") return 5;
  if (raw === "GRID_6") return 6;
  if (raw === "GRID_4") return 4;
  return clampSpecsGridCount(stored);
}

export function resolveCardPreviewLayout(
  row: CardPreviewLayoutRow | null | undefined
): CardPreviewLayoutResolved {
  if (!row) return FALLBACK_CARD_PREVIEW_LAYOUT;
  const rawStyle = row.specsStyle ?? undefined;
  const specsStyle = normalizeSpecsStyle(
    typeof rawStyle === "string" ? rawStyle : undefined
  );
  const specsGridCount = gridCountFromLegacyStyle(
    typeof rawStyle === "string" ? rawStyle : undefined,
    row.specsGridCount
  );
  const categorySource: CardPreviewCategorySourceId =
    row.categorySource &&
    CARD_PREVIEW_CATEGORY_SOURCES.includes(row.categorySource)
      ? row.categorySource
      : "PRODUCT_FOLDER";
  const max = slotMaxForSpecsStyle(specsStyle, specsGridCount);
  const slotKeys = [...row.slots]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((slot) => slot.attribute.key)
    .slice(0, max);
  const subtitleKeys =
    row.subtitleSlots == null
      ? []
      : [...row.subtitleSlots]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((slot) => slot.attribute.key)
          .slice(0, CARD_PREVIEW_SUBTITLE_FIELD_MAX);
  return {
    showName: row.showName,
    showPrice: row.showPrice,
    showStatus: row.showStatus,
    showSubtitle: row.showSubtitle,
    showSpecs: row.showSpecs !== false,
    specsStyle,
    specsGridCount,
    categorySource,
    layoutFolderName: row.taxonomyNode?.name?.trim() || null,
    slotKeys,
    subtitleKeys,
  };
}

/** Seed default layouts for nodes that have the classic truck keys. */
export async function seedDefaultCardPreviewLayouts(prisma: PrismaClient) {
  const nodes = await prisma.taxonomyNode.findMany({
    select: {
      id: true,
      cardPreviewLayout: { select: { id: true } },
    },
  });

  let created = 0;
  for (const node of nodes) {
    if (node.cardPreviewLayout) continue;
    await prisma.cardPreviewLayout.create({
      data: {
        taxonomyNodeId: node.id,
        specsStyle: "GRID",
        specsGridCount: 4,
      },
    });
    created += 1;
  }
  return created;
}

export async function fetchCardPreviewLayoutsByNodeIds(
  prisma: PrismaClient,
  nodeIds: string[]
) {
  const unique = [...new Set(nodeIds.filter(Boolean))];
  if (unique.length === 0) {
    return new Map<string, CardPreviewLayoutResolved>();
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

  const rows = await prisma.cardPreviewLayout.findMany({
    where: { taxonomyNodeId: { in: relatedIds } },
    include: {
      taxonomyNode: { select: { name: true } },
      slots: {
        orderBy: { sortOrder: "asc" },
        select: { sortOrder: true, attribute: { select: { key: true } } },
      },
      subtitleSlots: {
        orderBy: { sortOrder: "asc" },
        select: { sortOrder: true, attribute: { select: { key: true } } },
      },
    },
  });

  const byNodeId = new Map(
    rows.map((row) => [row.taxonomyNodeId, resolveCardPreviewLayout(row)] as const)
  );

  const map = new Map<string, CardPreviewLayoutResolved>();
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
