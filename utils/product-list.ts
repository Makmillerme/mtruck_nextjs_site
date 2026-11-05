/** Spec keys always pulled for cards (hardcoded fields in product-to-card). */
export const CARD_LIST_ALWAYS_KEYS = ["year", "location", "make"] as const;

export const productSpecCardSelect = {
  attribute: {
    select: { key: true, unit: true, name: true, sortOrder: true, type: true },
  },
  option: { select: { label: true } },
  selectedOptions: {
    select: { option: { select: { label: true } } },
  },
  numberValue: true,
  textValue: true,
  booleanValue: true,
} as const;

/**
 * Catalog / related / favorites list projection.
 * When `specKeys` is non-empty, only those attribute keys are loaded (card-preview slots).
 * Gallery capped at 2 extras (cover is `product.image`).
 */
export function buildProductListSelect(specKeys: string[] = []) {
  const uniqueKeys = [...new Set(specKeys.map((key) => key.trim()).filter(Boolean))];
  return {
    id: true,
    name: true,
    image: true,
    price: true,
    createdAt: true,
    status: true,
    taxonomyNodeId: true,
    taxonomyNode: { select: { name: true, slug: true } },
    specs: {
      ...(uniqueKeys.length > 0
        ? { where: { attribute: { key: { in: uniqueKeys } } } }
        : {}),
      select: productSpecCardSelect,
    },
    images: {
      select: { url: true },
      orderBy: { sortOrder: "asc" as const },
      take: 2,
    },
  } as const;
}

/** Static fallback (all specs) — prefer `buildProductListSelect` + card-preview keys. */
export const productListSelect = buildProductListSelect([]);

export type ProductListItem = {
  id: string;
  name: string;
  image: string;
  price: number;
  createdAt: Date;
  status: string;
  taxonomyNodeId: string | null;
  taxonomyNode: { name: string; slug: string } | null;
  specs: {
    attribute: {
      key: string;
      unit: string | null;
      name: string;
      sortOrder: number;
      type: string;
    };
    option: { label: string } | null;
    selectedOptions?: { option: { label: string } }[];
    numberValue: number | null;
    textValue: string | null;
    booleanValue: boolean | null;
  }[];
  images: { url: string }[];
};
