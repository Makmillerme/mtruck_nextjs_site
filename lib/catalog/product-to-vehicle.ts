import type { VehicleCardModel, VehicleStatus } from "@/components/vehicles/vehicle-card";

export type SpecForCard = {
  attribute: { key: string; unit: string | null };
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

export function productWithSpecsToVehicle(product: {
  id: string;
  name: string;
  price: number;
  image: string;
  company: string;
  status?: string;
  taxonomyNode?: { name: string } | null;
  specs?: SpecForCard[];
}): VehicleCardModel {
  const specs = specMap(product.specs ?? []);
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    href: `/products/${product.id}`,
    status: (product.status as VehicleStatus | undefined) ?? "PUBLISHED",
    year: numberValue(specs, "year"),
    mileage: numberValue(specs, "mileage"),
    euro: optionLabel(specs, "euro"),
    transmission: optionLabel(specs, "transmission"),
    feature: textValue(specs, "feature"),
    location: textValue(specs, "location"),
    categoryLabel:
      product.taxonomyNode?.name ??
      optionLabel(specs, "make") ??
      product.company,
  };
}

export function formatSpecDisplay(spec: SpecForCard): string {
  if (spec.option?.label) return spec.option.label;
  if (spec.numberValue != null) {
    const unit = spec.attribute.unit ? ` ${spec.attribute.unit}` : "";
    return `${spec.numberValue}${unit}`;
  }
  if (spec.textValue) return spec.textValue;
  if (spec.booleanValue != null) return spec.booleanValue ? "Так" : "Ні";
  return "—";
}
