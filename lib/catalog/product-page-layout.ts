import type { PrismaClient } from "@prisma/client";

export const PRODUCT_PAGE_TAB_KINDS = ["TEXT", "TABLE", "LIST"] as const;
export type ProductPageTabKindName = (typeof PRODUCT_PAGE_TAB_KINDS)[number];

export const PRODUCT_PAGE_SYSTEM_SOURCES = ["DESCRIPTION"] as const;
export type ProductPageSystemSourceName =
  (typeof PRODUCT_PAGE_SYSTEM_SOURCES)[number];

export const KEY_FACTS_MAX_MIN = 2;
export const KEY_FACTS_MAX_MAX = 12;
export const KEY_FACTS_MAX_DEFAULT = 6;

export function clampKeyFactsMax(value: number) {
  if (!Number.isFinite(value)) return KEY_FACTS_MAX_DEFAULT;
  return Math.min(
    KEY_FACTS_MAX_MAX,
    Math.max(KEY_FACTS_MAX_MIN, Math.round(value))
  );
}

export type ProductPageSpecSlotResolved = {
  attributeId: string;
  attributeKey: string;
  sortOrder: number;
  visible: boolean;
};

export type ProductPageKeyFactSlotResolved = {
  attributeId: string;
  attributeKey: string;
  sortOrder: number;
  visible: boolean;
};

export type ProductPageTabSlotResolved = {
  attributeId: string | null;
  attributeKey: string | null;
  systemSource: ProductPageSystemSourceName | null;
  sortOrder: number;
  visible: boolean;
};

export type ProductPageTabResolved = {
  id: string;
  name: string;
  kind: ProductPageTabKindName;
  sortOrder: number;
  slots: ProductPageTabSlotResolved[];
};

export type ProductPageLayoutResolved = {
  keyFactsMax: number;
  keyFactSlots: ProductPageKeyFactSlotResolved[];
  /** Leaf folder has its own ProductPageLayout row from UI Editor. */
  hasLayout: boolean;
  /** Leaf layout has saved key-fact picks (opt-in list). */
  keyFactsConfigured: boolean;
  tabs: ProductPageTabResolved[];
  /** Legacy flat TABLE slots (compat). */
  slots: ProductPageSpecSlotResolved[];
};

export type ProductPageLayoutRow = {
  keyFactsMax?: number;
  slots: {
    sortOrder: number;
    visible: boolean;
    attributeId: string;
    attribute: { key: string };
  }[];
  keyFactSlots?: {
    sortOrder: number;
    visible: boolean;
    attributeId: string;
    attribute: { key: string };
  }[];
  tabs?: {
    id: string;
    name: string;
    kind: ProductPageTabKindName;
    sortOrder: number;
    slots: {
      sortOrder: number;
      visible: boolean;
      attributeId: string | null;
      systemSource: ProductPageSystemSourceName | null;
      attribute: { key: string } | null;
    }[];
  }[];
};

export type AvailableAttributeForLayout = {
  id: string;
  key: string;
  sortOrder?: number;
  name?: string;
  type?: string;
  textInput?: string | null;
};

export function isKeyFactEligibleAttribute(attr: AvailableAttributeForLayout) {
  if (attr.type === "TEXT" && attr.textInput === "AREA") return false;
  return true;
}

/** TEXT tab look: only multi-line TEXT AREA attributes (plus system DESCRIPTION). */
export function isTextAreaTabEligibleAttribute(
  attr: AvailableAttributeForLayout
) {
  return attr.type === "TEXT" && attr.textInput === "AREA";
}

function sortAvailable(available: AvailableAttributeForLayout[]) {
  return [...available].sort(
    (a, b) =>
      (a.sortOrder ?? 0) - (b.sortOrder ?? 0) ||
      (a.name ?? a.key).localeCompare(b.name ?? b.key, "uk")
  );
}

function mergeAttributeSlots(
  saved:
    | {
        sortOrder: number;
        visible: boolean;
        attributeId: string;
        attribute: { key: string };
      }[]
    | undefined,
  available: AvailableAttributeForLayout[],
  opts?: {
    filter?: (attr: AvailableAttributeForLayout) => boolean;
    /** When true, attrs missing from saved start hidden (opt-in pickers). */
    defaultVisible?: boolean;
    /** When false and saved empty, return []. */
    seedAllWhenEmpty?: boolean;
  }
): ProductPageSpecSlotResolved[] {
  const filtered = opts?.filter
    ? available.filter(opts.filter)
    : available;
  const sortedAvailable = sortAvailable(filtered);
  const byId = new Map(sortedAvailable.map((attr) => [attr.id, attr] as const));
  const defaultVisible = opts?.defaultVisible ?? true;
  const seedAllWhenEmpty = opts?.seedAllWhenEmpty ?? true;

  if (!saved || saved.length === 0) {
    if (!seedAllWhenEmpty) return [];
    return sortedAvailable.map((attr, index) => ({
      attributeId: attr.id,
      attributeKey: attr.key,
      sortOrder: index,
      visible: defaultVisible,
    }));
  }

  const used = new Set<string>();
  const slots: ProductPageSpecSlotResolved[] = [];
  for (const slot of [...saved].sort((a, b) => a.sortOrder - b.sortOrder)) {
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
      visible: defaultVisible,
    });
  }
  return slots;
}

/**
 * Resolve layout for PDP / editor.
 * Legacy SpecSlots without tabs → one TABLE tab "Характеристики".
 */
export function resolveProductPageLayout(
  row: ProductPageLayoutRow | null | undefined,
  available: AvailableAttributeForLayout[]
): ProductPageLayoutResolved {
  const keyFactsMax = clampKeyFactsMax(row?.keyFactsMax ?? KEY_FACTS_MAX_DEFAULT);
  const hasSavedKeyFacts = Boolean(
    row?.keyFactSlots && row.keyFactSlots.length > 0
  );
  // Opt-in picker: do not pre-select every field (that hid MemberOrderPicker).
  // Runtime falls back to sortOrder top-N when no visible key-fact slots.
  const keyFactSlots = mergeAttributeSlots(row?.keyFactSlots, available, {
    filter: isKeyFactEligibleAttribute,
    defaultVisible: false,
    seedAllWhenEmpty: !hasSavedKeyFacts,
  }).map((slot) => ({
    attributeId: slot.attributeId,
    attributeKey: slot.attributeKey,
    sortOrder: slot.sortOrder,
    visible: slot.visible,
  }));

  const legacySlots = mergeAttributeSlots(row?.slots, available);

  let tabs: ProductPageTabResolved[] = [];
  if (row?.tabs && row.tabs.length > 0) {
    const byId = new Map(available.map((attr) => [attr.id, attr] as const));
    tabs = [...row.tabs]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((tab, tabIndex) => {
        const slots: ProductPageTabSlotResolved[] = [...tab.slots]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((slot, index) => {
            if (slot.systemSource === "DESCRIPTION") {
              return {
                attributeId: null,
                attributeKey: null,
                systemSource: "DESCRIPTION" as const,
                sortOrder: index,
                visible: slot.visible,
              };
            }
            const attr = slot.attributeId
              ? byId.get(slot.attributeId)
              : undefined;
            if (!attr) return null;
            return {
              attributeId: attr.id,
              attributeKey: attr.key,
              systemSource: null,
              sortOrder: index,
              visible: slot.visible,
            };
          })
          .filter(Boolean) as ProductPageTabSlotResolved[];

        return {
          id: tab.id,
          name: tab.name,
          kind: tab.kind,
          sortOrder: tabIndex,
          slots,
        };
      });
  } else {
    tabs = [
      {
        id: "legacy-table",
        name: "Характеристики",
        kind: "TABLE",
        sortOrder: 0,
        slots: legacySlots.map((slot) => ({
          attributeId: slot.attributeId,
          attributeKey: slot.attributeKey,
          systemSource: null,
          sortOrder: slot.sortOrder,
          visible: slot.visible,
        })),
      },
    ];
  }

  return {
    keyFactsMax,
    keyFactSlots,
    hasLayout: Boolean(row),
    keyFactsConfigured: hasSavedKeyFacts,
    tabs,
    slots: legacySlots,
  };
}

const layoutInclude = {
  slots: {
    orderBy: { sortOrder: "asc" as const },
    select: {
      sortOrder: true,
      visible: true,
      attributeId: true,
      attribute: { select: { key: true } },
    },
  },
  keyFactSlots: {
    orderBy: { sortOrder: "asc" as const },
    select: {
      sortOrder: true,
      visible: true,
      attributeId: true,
      attribute: { select: { key: true } },
    },
  },
  tabs: {
    orderBy: { sortOrder: "asc" as const },
    select: {
      id: true,
      name: true,
      kind: true,
      sortOrder: true,
      slots: {
        orderBy: { sortOrder: "asc" as const },
        select: {
          sortOrder: true,
          visible: true,
          attributeId: true,
          systemSource: true,
          attribute: { select: { key: true } },
        },
      },
    },
  },
} as const;

/** Leaf-only: layout for the product folder itself, never ancestors. */
export async function fetchProductPageLayoutsByNodeIds(
  prisma: PrismaClient,
  nodeIds: string[]
) {
  const unique = [...new Set(nodeIds.filter(Boolean))];
  if (unique.length === 0) {
    return new Map<string, ProductPageLayoutRow>();
  }

  try {
    const rows = await prisma.productPageLayout.findMany({
      where: { taxonomyNodeId: { in: unique } },
      include: layoutInclude,
    });

    return new Map(
      rows.map(
        (row) => [row.taxonomyNodeId, row as ProductPageLayoutRow] as const
      )
    );
  } catch (error) {
    console.error("fetchProductPageLayoutsByNodeIds", error);
    return new Map<string, ProductPageLayoutRow>();
  }
}

export { layoutInclude as productPageLayoutInclude };
