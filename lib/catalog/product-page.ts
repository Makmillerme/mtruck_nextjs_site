import type {
  ProductPageLayoutResolved,
  ProductPageTabResolved,
} from "@/lib/catalog/product-page-layout";
import {
  clampKeyFactsMax,
  isTextAreaTabEligibleAttribute,
} from "@/lib/catalog/product-page-layout";
import type { CatalogDisplayGroup } from "@/lib/catalog/types";
import {
  formatSpecDisplay,
  type SpecForCard,
} from "@/lib/catalog/product-to-vehicle";

export const PRODUCT_KEY_FACTS_MAX = 6;

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

export type ProductEquipmentGroup = {
  id: string;
  title: string;
  items: string[];
};

export type ProductKeyFact = {
  key: string;
  label: string;
  value: string;
};

export type ProductDetailsTab =
  | {
      id: string;
      name: string;
      kind: "TEXT";
      body: string;
    }
  | {
      id: string;
      name: string;
      kind: "TABLE";
      groups: ProductSpecGroup[];
    }
  | {
      id: string;
      name: string;
      kind: "LIST";
      items: string[];
    };

type SpecWithIds = SpecForCard & {
  id: string;
  attribute: SpecForCard["attribute"] & {
    id: string;
    name: string;
    type?: string | null;
    textInput?: string | null;
    sortOrder?: number;
  };
};

function hasDisplayValue(spec: SpecForCard, locale = "uk"): boolean {
  const value = formatProductSpecValue(spec, locale);
  return Boolean(value && value !== "—");
}

function listItemsFromSpec(spec: SpecWithIds): string[] {
  if (spec.attribute.type === "MULTI_SELECT") {
    return (spec.selectedOptions ?? [])
      .map((row) => row.option.label.trim())
      .filter(Boolean);
  }
  if (spec.attribute.type === "BOOLEAN") {
    return spec.booleanValue ? [spec.attribute.name] : [];
  }
  const value = formatProductSpecValue(spec, "uk");
  return value && value !== "—" ? [value] : [];
}

/** Key facts from layout slots (no keyword hardcode). */
export function buildProductKeyFacts(
  specs: SpecWithIds[],
  maxOrLayout: number | ProductPageLayoutResolved | null = PRODUCT_KEY_FACTS_MAX,
  locale = "uk"
): ProductKeyFact[] {
  const byAttrId = new Map(specs.map((spec) => [spec.attribute.id, spec]));
  const byKey = new Map(specs.map((spec) => [spec.attribute.key, spec]));

  if (maxOrLayout && typeof maxOrLayout === "object") {
    const layout = maxOrLayout;
    const max = clampKeyFactsMax(layout.keyFactsMax);
    const facts: ProductKeyFact[] = [];
    for (const slot of layout.keyFactSlots) {
      if (!slot.visible) continue;
      const spec =
        byAttrId.get(slot.attributeId) ?? byKey.get(slot.attributeKey);
      if (!spec || !hasDisplayValue(spec, locale)) continue;
      if (spec.attribute.type === "TEXT" && spec.attribute.textInput === "AREA") {
        continue;
      }
      facts.push({
        key: spec.attribute.key,
        label: spec.attribute.name,
        value: formatProductSpecValue(spec, locale),
      });
      if (facts.length >= max) break;
    }
    // Leaf UI Editor layout: only picked key facts — never invent sortOrder top-N.
    if (layout.hasLayout || layout.keyFactsConfigured || facts.length > 0) {
      return facts;
    }
  }

  const max =
    typeof maxOrLayout === "number"
      ? maxOrLayout
      : maxOrLayout && typeof maxOrLayout === "object"
        ? clampKeyFactsMax(maxOrLayout.keyFactsMax)
        : PRODUCT_KEY_FACTS_MAX;
  const ranked = [...specs]
    .filter(
      (spec) =>
        spec.attribute.type !== "MULTI_SELECT" &&
        !(spec.attribute.type === "TEXT" && spec.attribute.textInput === "AREA") &&
        hasDisplayValue(spec, locale)
    )
    .sort(
      (a, b) =>
        (a.attribute.sortOrder ?? 0) - (b.attribute.sortOrder ?? 0) ||
        a.attribute.name.localeCompare(b.attribute.name, "uk")
    );

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

function buildTableGroupsFromTab(
  tab: ProductPageTabResolved,
  specs: SpecWithIds[],
  locale: string
): ProductSpecGroup[] {
  const byAttrId = new Map(specs.map((spec) => [spec.attribute.id, spec]));
  const byKey = new Map(specs.map((spec) => [spec.attribute.key, spec]));
  const rows: ProductSpecRow[] = [];
  for (const slot of tab.slots) {
    if (!slot.visible || slot.systemSource || !slot.attributeId) continue;
    const spec =
      byAttrId.get(slot.attributeId) ??
      (slot.attributeKey ? byKey.get(slot.attributeKey) : undefined);
    if (!spec || !hasDisplayValue(spec, locale)) continue;
    rows.push({
      id: spec.id,
      label: spec.attribute.name,
      value: formatProductSpecValue(spec, locale),
    });
  }
  return rows.length > 0 ? [{ id: tab.id, title: "", rows }] : [];
}

export function buildProductDetailsTabs(
  specs: SpecWithIds[],
  layout: ProductPageLayoutResolved | null,
  description: string | null | undefined,
  locale = "uk"
): ProductDetailsTab[] {
  const tabs = layout?.tabs?.length
    ? layout.tabs
    : ([
        {
          id: "fallback-table",
          name: "Характеристики",
          kind: "TABLE" as const,
          sortOrder: 0,
          slots: specs
            .filter((spec) => spec.attribute.type !== "MULTI_SELECT")
            .map((spec, index) => ({
              attributeId: spec.attribute.id,
              attributeKey: spec.attribute.key,
              systemSource: null,
              sortOrder: index,
              visible: true,
            })),
        },
      ] satisfies ProductPageTabResolved[]);

  const byAttrId = new Map(specs.map((spec) => [spec.attribute.id, spec]));
  const byKey = new Map(specs.map((spec) => [spec.attribute.key, spec]));
  const result: ProductDetailsTab[] = [];

  for (const tab of tabs) {
    if (tab.kind === "TEXT") {
      const slot = tab.slots.find((item) => item.visible);
      let body = "";
      if (!slot || slot.systemSource === "DESCRIPTION") {
        // Empty TEXT tab (misconfigured) → system description.
        body = description?.trim() ?? "";
      } else if (slot.attributeId) {
        const spec =
          byAttrId.get(slot.attributeId) ??
          (slot.attributeKey ? byKey.get(slot.attributeKey) : undefined);
        if (
          spec &&
          isTextAreaTabEligibleAttribute({
            id: spec.attribute.id,
            key: spec.attribute.key,
            type: spec.attribute.type ?? undefined,
            textInput: spec.attribute.textInput,
          })
        ) {
          body = spec.textValue?.trim() ?? "";
        }
      }
      if (!body) continue;
      result.push({ id: tab.id, name: tab.name, kind: "TEXT", body });
      continue;
    }

    if (tab.kind === "LIST") {
      const items: string[] = [];
      for (const slot of tab.slots) {
        if (!slot.visible || !slot.attributeId) continue;
        const spec =
          byAttrId.get(slot.attributeId) ??
          (slot.attributeKey ? byKey.get(slot.attributeKey) : undefined);
        if (!spec) continue;
        items.push(...listItemsFromSpec(spec));
      }
      if (items.length === 0) continue;
      result.push({ id: tab.id, name: tab.name, kind: "LIST", items });
      continue;
    }

    const groups = buildTableGroupsFromTab(tab, specs, locale);
    if (groups.length === 0) continue;
    result.push({ id: tab.id, name: tab.name, kind: "TABLE", groups });
  }

  return result;
}

/** @deprecated Prefer LIST tabs from layout. */
export function buildProductEquipmentGroups(
  specs: SpecWithIds[],
  locale = "uk"
): ProductEquipmentGroup[] {
  const multi = specs.filter(
    (spec) =>
      spec.attribute.type === "MULTI_SELECT" && hasDisplayValue(spec, locale)
  );
  if (multi.length === 0) return [];
  return multi
    .slice()
    .sort(
      (a, b) =>
        (a.attribute.sortOrder ?? 0) - (b.attribute.sortOrder ?? 0) ||
        a.attribute.name.localeCompare(b.attribute.name, "uk")
    )
    .map((spec) => {
      const items = (spec.selectedOptions ?? [])
        .map((row) => row.option.label.trim())
        .filter(Boolean);
      return {
        id: spec.id,
        title: spec.attribute.name,
        items,
      };
    })
    .filter((group) => group.items.length > 0);
}

export function buildProductSpecGroups(
  specs: SpecWithIds[],
  _displayGroups: CatalogDisplayGroup[] = [],
  locale = "uk",
  layout: ProductPageLayoutResolved | null = null
): ProductSpecGroup[] {
  if (layout?.tabs?.length) {
    const tableTab = layout.tabs.find((tab) => tab.kind === "TABLE");
    if (tableTab) return buildTableGroupsFromTab(tableTab, specs, locale);
  }

  const withValues = specs.filter(
    (spec) =>
      spec.attribute.type !== "MULTI_SELECT" && hasDisplayValue(spec, locale)
  );
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
