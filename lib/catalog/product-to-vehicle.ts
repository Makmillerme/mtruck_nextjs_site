import type { VehicleCardModel, VehicleStatus } from "@/components/vehicles/vehicle-card";
import {
  FALLBACK_CARD_PREVIEW_LAYOUT,
  type CardPreviewLayoutResolved,
} from "@/lib/catalog/card-preview";

export type SpecForCard = {
  attribute: { key: string; unit: string | null; name?: string };
  option: { label: string } | null;
  numberValue: number | null;
  textValue: string | null;
  booleanValue: boolean | null;
};

function specMap(specs: SpecForCard[]) {
  const map = new Map<string, SpecForCard>();
  for (const spec of specs) {
    map.set(spec.attribute.key, spec);
  }
  return map;
}

function optionLabel(specs: Map<string, SpecForCard>, key: string) {
  return specs.get(key)?.option?.label ?? null;
}

function numberValue(specs: Map<string, SpecForCard>, key: string) {
  const value = specs.get(key)?.numberValue;
  return value == null ? null : value;
}

function textValue(specs: Map<string, SpecForCard>, key: string) {
  return specs.get(key)?.textValue?.trim() || null;
}

export function uniqueImages(cover: string, gallery: string[] = []) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const url of [cover, ...gallery]) {
    const trimmed = url?.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    out.push(trimmed);
  }
  return out;
}

function intlLocale(locale: string) {
  if (locale === "uk") return "uk-UA";
  if (locale === "de") return "de-DE";
  return "en-US";
}

/** Locale-aware number + unit (e.g. 505 000 км). */
export function formatSpecDisplay(spec: SpecForCard, locale = "uk"): string {
  if (spec.option?.label) return spec.option.label;
  if (spec.numberValue != null) {
    const formatted = new Intl.NumberFormat(intlLocale(locale), {
      maximumFractionDigits: 0,
    }).format(spec.numberValue);
    const unit = spec.attribute.unit ? ` ${spec.attribute.unit}` : "";
    return `${formatted}${unit}`;
  }
  if (spec.textValue) return spec.textValue;
  if (spec.booleanValue != null) return spec.booleanValue ? "Так" : "Ні";
  return "—";
}

function buildSpecItems(
  specs: SpecForCard[],
  slotKeys: string[],
  locale = "uk"
): { key: string; label: string; value: string }[] {
  const byKey = new Map(specs.map((spec) => [spec.attribute.key, spec]));
  return slotKeys.map((key) => {
    const spec = byKey.get(key);
    return {
      key,
      label: spec?.attribute.name ?? key,
      value: spec ? formatSpecDisplay(spec, locale) : "—",
    };
  });
}

export function productWithSpecsToVehicle(
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    status?: string;
    taxonomyNode?: { name: string } | null;
    specs?: SpecForCard[];
    images?: { url: string }[];
  },
  layout: CardPreviewLayoutResolved | null | undefined = FALLBACK_CARD_PREVIEW_LAYOUT,
  locale = "uk"
): VehicleCardModel {
  const resolved = layout ?? FALLBACK_CARD_PREVIEW_LAYOUT;
  const specs = product.specs ?? [];
  const byKey = specMap(specs);
  const images = uniqueImages(
    product.image,
    product.images?.map((item) => item.url) ?? []
  );
  const categoryLabel =
    resolved.categorySource === "LAYOUT_FOLDER"
      ? resolved.layoutFolderName ??
        product.taxonomyNode?.name ??
        optionLabel(byKey, "make") ??
        null
      : product.taxonomyNode?.name ??
        optionLabel(byKey, "make") ??
        null;

  const fieldParts = resolved.subtitleKeys
    .map((key) => {
      const spec = byKey.get(key);
      return spec ? formatSpecDisplay(spec, locale) : null;
    })
    .filter((value): value is string => Boolean(value && value !== "—"));

  const subtitleParts = [
    categoryLabel?.trim() || "—",
    ...fieldParts.slice(0, 2),
  ];

  return {
    id: product.id,
    name: product.name,
    price: product.price,
    image: images[0] ?? product.image,
    images,
    href: `/products/${product.id}`,
    status: (product.status as VehicleStatus | undefined) ?? "PUBLISHED",
    year: numberValue(byKey, "year"),
    location: textValue(byKey, "location"),
    categoryLabel,
    subtitleParts,
    specItems: resolved.showSpecs
      ? buildSpecItems(specs, resolved.slotKeys, locale)
      : [],
    specsStyle: resolved.specsStyle,
    specsGridCount: resolved.specsGridCount,
    showName: resolved.showName,
    showPrice: resolved.showPrice,
    showStatus: resolved.showStatus,
    showSubtitle: resolved.showSubtitle,
    showSpecs: resolved.showSpecs,
  };
}
