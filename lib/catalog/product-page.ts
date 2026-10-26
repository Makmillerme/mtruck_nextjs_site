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

function flatSpecRows(specs: SpecWithIds[], locale = "uk"): ProductSpecRow[] {
  return [...specs]
    .sort(
      (a, b) => (a.attribute.sortOrder ?? 0) - (b.attribute.sortOrder ?? 0)
    )
    .filter((spec) => hasDisplayValue(spec, locale))
    .map((spec) => ({
      id: spec.id,
      label: spec.attribute.name,
      value: formatProductSpecValue(spec, locale),
    }));
}

/**
 * Group specs by DisplayGroup (skip name writers).
 * Fallback: one untitled flat group when groups are empty or cover nothing.
 */
export function buildProductSpecGroups(
  specs: SpecWithIds[],
  displayGroups: CatalogDisplayGroup[],
  locale = "uk"
): ProductSpecGroup[] {
  const byAttributeId = new Map(
    specs.map((spec) => [spec.attribute.id, spec] as const)
  );
  const contentGroups = displayGroups
    .filter((group) => !group.writesProductName)
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (contentGroups.length === 0) {
    const rows = flatSpecRows(specs, locale);
    return rows.length > 0
      ? [{ id: "all", title: "", rows }]
      : [];
  }

  const used = new Set<string>();
  const groups: ProductSpecGroup[] = [];

  for (const group of contentGroups) {
    const rows: ProductSpecRow[] = [];
    for (const member of group.members) {
      const spec = byAttributeId.get(member.attributeId);
      if (!spec || !hasDisplayValue(spec, locale)) continue;
      used.add(spec.attribute.id);
      rows.push({
        id: spec.id,
        label: member.attribute.name,
        value: formatProductSpecValue(spec, locale),
      });
    }
    if (rows.length > 0) {
      groups.push({ id: group.id, title: group.name, rows });
    }
  }

  const rest = flatSpecRows(
    specs.filter((spec) => !used.has(spec.attribute.id)),
    locale
  );
  if (rest.length > 0) {
    groups.push({ id: "other", title: "", rows: rest });
  }

  if (groups.length === 0) {
    const rows = flatSpecRows(specs, locale);
    return rows.length > 0
      ? [{ id: "all", title: "", rows }]
      : [];
  }

  return groups;
}
