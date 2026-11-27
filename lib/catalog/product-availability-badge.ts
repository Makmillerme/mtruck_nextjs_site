import type { ProductAvailability, ProductStatus } from "@prisma/client";

/** Statuses that appear in the public catalog / related / home finder. */
export const STOREFRONT_PRODUCT_STATUSES = ["PUBLISHED", "RESERVED"] as const;

export type StorefrontProductStatus = (typeof STOREFRONT_PRODUCT_STATUSES)[number];

export type PublicAvailabilityBadgeKind =
  | "sold"
  | "reserved"
  | "in_stock"
  | "transit"
  | "on_order";

export type PublicAvailabilityBadgeTone = "default" | "secondary" | "outline";

export type PublicAvailabilityBadge = {
  kind: PublicAvailabilityBadgeKind;
  /** next-intl key under Product namespace */
  labelKey: string;
  tone: PublicAvailabilityBadgeTone;
  /** Dot color class for card overlay badge */
  dotClassName: string;
  /** Soft chip colors for PDP / admin availability tags */
  chipClassName: string;
};

/**
 * Single public badge from commercial status + logistics.
 * Priority: SOLD > RESERVED > availability.
 */
export function resolvePublicAvailabilityBadge(input: {
  status: ProductStatus | string | null | undefined;
  availability: ProductAvailability | string | null | undefined;
}): PublicAvailabilityBadge | null {
  const status = input.status ?? "PUBLISHED";
  const availability = input.availability ?? "IN_STOCK";

  if (status === "SOLD") {
    return {
      kind: "sold",
      labelKey: "availabilitySold",
      tone: "secondary",
      dotClassName: "bg-muted-foreground",
      chipClassName:
        "border-transparent bg-muted text-muted-foreground hover:bg-muted",
    };
  }

  if (status === "RESERVED") {
    return {
      kind: "reserved",
      labelKey: "availabilityReserved",
      tone: "secondary",
      dotClassName: "bg-amber-500",
      chipClassName:
        "border-transparent bg-amber-400/25 text-amber-900 hover:bg-amber-400/25 dark:text-amber-100",
    };
  }

  if (status !== "PUBLISHED") {
    return null;
  }

  if (availability === "TRANSIT") {
    return {
      kind: "transit",
      labelKey: "availabilityTransit",
      tone: "secondary",
      dotClassName: "bg-sky-500",
      chipClassName:
        "border-transparent bg-sky-500/15 text-sky-800 hover:bg-sky-500/15 dark:text-sky-200",
    };
  }

  if (availability === "ON_ORDER") {
    return {
      kind: "on_order",
      labelKey: "availabilityOnOrder",
      tone: "outline",
      dotClassName: "bg-violet-500",
      chipClassName:
        "border-transparent bg-violet-500/15 text-violet-800 hover:bg-violet-500/15 dark:text-violet-200",
    };
  }

  return {
    kind: "in_stock",
    labelKey: "availabilityStock",
    tone: "default",
    dotClassName: "bg-emerald-500",
    chipClassName:
      "border-transparent bg-emerald-500/15 text-emerald-800 hover:bg-emerald-500/15 dark:text-emerald-200",
  };
}

export function canPlaceProductOrder(
  status: ProductStatus | string | null | undefined
): boolean {
  const s = status ?? "PUBLISHED";
  return s === "PUBLISHED";
}

export function storefrontStatusWhere(): {
  in: Array<StorefrontProductStatus>;
} {
  return { in: [...STOREFRONT_PRODUCT_STATUSES] };
}
