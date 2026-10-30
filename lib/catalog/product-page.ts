import type { ProductPageLayoutResolved } from "@/lib/catalog/product-page-layout";
import type { CatalogDisplayGroup } from "@/lib/catalog/types";
import {
  formatSpecDisplay,
  type SpecForCard,
} from "@/lib/catalog/product-to-vehicle";

export const PRODUCT_KEY_FACTS_MAX = 6;

/** Prefer decision fields over make/model (already in the title). */
const KEY_FACT_PRIORITY = [
  "year",
  "mileage",
  "km",
  "odometer",
  "power",
  "hp",
  "euro",
  "emission",
  "transmission",
  "gearbox",
  "fuel",
  "axle",
  "wheel",
];

function intlLocale(locale: string) {
  if (locale === "uk") return "uk-UA";
  if (locale === "de") return "de-DE";
  return "en-US";
}

/** Locale-aware number + unit for PDP (e.g. 505 000 км). */
export function formatProductSpecValue(
  spec: SpecForCard,
  locale = "uk"
): string {
  return formatSpecDisplay(spec, locale);
}

export function formatProductPrice(
  amount: number | null,
  locale = "uk",
  currency: "USD" | "EUR" | "UAH" = "USD"
) {
  const value = amount || 0;
  return new Intl.NumberFormat(intlLocale(locale), {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export type ProductSpecRow = {
  id: string;
  label: string;
  value: string;
};

export type ProductSpecGroup = {
  id: string;
  title: string;
  rows: ProductSpecRow[];
};

export type ProductKeyFact = {
  key: string;
  label: string;
  value: string;
};

type SpecWithIds = SpecForCard & {
  id: string;
  attribute: SpecForCard["attribute"] & {
    id: string;
    name: string;
    sortOrder?: number;
  };
};

function hasDisplayValue(spec: SpecForCard, locale = "uk"): boolean {
  const value = formatProductSpecValue(spec, locale);
  return Boolean(value && value !== "—");
}

function priorityScore(key: string): number {
  const normalized = key.toLowerCase();
  const index = KEY_FACT_PRIORITY.findIndex((fragment) =>
    normalized.includes(fragment)
  );
  return index === -1 ? KEY_FACT_PRIORITY.length + 50 : index;
}

/** Decision-oriented key facts (year/mileage/power…), locale-formatted. */
export function buildProductKeyFacts(
  specs: SpecWithIds[],
  max = PRODUCT_KEY_FACTS_MAX,
  locale = "uk"
): ProductKeyFact[] {
  const ranked = [...specs]
    .filter((spec) => hasDisplayValue(spec, locale))
    .sort((a, b) => {
      const byPriority =
        priorityScore(a.attribute.key) - priorityScore(b.attribute.key);
      if (byPriority !== 0) return byPriority;
      return (a.attribute.sortOrder ?? 0) - (b.attribute.sortOrder ?? 0);
    });

  const facts: ProductKeyFact[] = [];
  for (const spec of ranked) {
    facts.push({
      key: spec.attribute.key,
      label: spec.attribute.name,
      value: formatProductSpecValue(spec, locale),
    });
    if (facts.length >= max) break;
  }
  return facts;
}

/**
 * PDP specs table: one UI block from catalog fields.
 * Default: model sortOrder. Optional ProductPageLayout: order + visibility.
 * `displayGroups` kept for call-site compat; ignored.
 */
export function buildProductSpecGroups(
  specs: SpecWithIds[],
  _displayGroups: CatalogDisplayGroup[] = [],
  locale = "uk",
  layout: ProductPageLayoutResolved | null = null
): ProductSpecGroup[] {
  const withValues = specs.filter((spec) => hasDisplayValue(spec, locale));
  if (withValues.length === 0) return [];

  let ordered: SpecWithIds[];
  if (layout && layout.slots.length > 0) {
    const byAttrId = new Map(
      withValues.map((spec) => [spec.attribute.id, spec] as const)
    );
    const byKey = new Map(
      withValues.map((spec) => [spec.attribute.key, spec] as const)
    );
    const used = new Set<string>();
    const next: SpecWithIds[] = [];

    for (const slot of layout.slots) {
      if (!slot.visible) continue;
      const spec =
        byAttrId.get(slot.attributeId) ?? byKey.get(slot.attributeKey);
      if (!spec || used.has(spec.id)) continue;
      used.add(spec.id);
      next.push(spec);
    }
    ordered = next;
  } else {
    ordered = [...withValues].sort(
      (a, b) =>
        (a.attribute.sortOrder ?? 0) - (b.attribute.sortOrder ?? 0) ||
        a.attribute.name.localeCompare(b.attribute.name, "uk")
    );
  }

  const rows: ProductSpecRow[] = ordered.map((spec) => ({
    id: spec.id,
    label: spec.attribute.name,
    value: formatProductSpecValue(spec, locale),
  }));

  return rows.length > 0 ? [{ id: "all", title: "", rows }] : [];
}
