import type { CatalogDisplayGroup } from "@/lib/catalog/types";
import {
  formatSpecDisplay,
  type SpecForCard,
} from "@/lib/catalog/product-to-vehicle";

export const PRODUCT_KEY_FACTS_MAX = 6;

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

function hasDisplayValue(spec: SpecForCard): boolean {
  const value = formatSpecDisplay(spec);
  return Boolean(value && value !== "—");
}

/** First N non-empty specs by attribute.sortOrder for the key-facts strip. */
export function buildProductKeyFacts(
  specs: SpecWithIds[],
  max = PRODUCT_KEY_FACTS_MAX
): ProductKeyFact[] {
  const sorted = [...specs].sort(
    (a, b) => (a.attribute.sortOrder ?? 0) - (b.attribute.sortOrder ?? 0)
  );
  const facts: ProductKeyFact[] = [];
  for (const spec of sorted) {
    if (!hasDisplayValue(spec)) continue;
    facts.push({
      key: spec.attribute.key,
      label: spec.attribute.name,
      value: formatSpecDisplay(spec),
    });
    if (facts.length >= max) break;
  }
  return facts;
}

function flatSpecRows(specs: SpecWithIds[]): ProductSpecRow[] {
  return [...specs]
    .sort(
      (a, b) => (a.attribute.sortOrder ?? 0) - (b.attribute.sortOrder ?? 0)
    )
    .filter(hasDisplayValue)
    .map((spec) => ({
      id: spec.id,
      label: spec.attribute.name,
      value: formatSpecDisplay(spec),
    }));
}

/**
 * Group specs by DisplayGroup (skip name writers).
 * Fallback: one untitled flat group when groups are empty or cover nothing.
 */
export function buildProductSpecGroups(
  specs: SpecWithIds[],
  displayGroups: CatalogDisplayGroup[]
): ProductSpecGroup[] {
  const byAttributeId = new Map(
    specs.map((spec) => [spec.attribute.id, spec] as const)
  );
  const contentGroups = displayGroups
    .filter((group) => !group.writesProductName)
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (contentGroups.length === 0) {
    const rows = flatSpecRows(specs);
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
      if (!spec || !hasDisplayValue(spec)) continue;
      used.add(spec.attribute.id);
      rows.push({
        id: spec.id,
        label: member.attribute.name,
        value: formatSpecDisplay(spec),
      });
    }
    if (rows.length > 0) {
      groups.push({ id: group.id, title: group.name, rows });
    }
  }

  const rest = flatSpecRows(
    specs.filter((spec) => !used.has(spec.attribute.id))
  );
  if (rest.length > 0) {
    groups.push({ id: "other", title: "", rows: rest });
  }

  if (groups.length === 0) {
    const rows = flatSpecRows(specs);
    return rows.length > 0
      ? [{ id: "all", title: "", rows }]
      : [];
  }

  return groups;
}
