import type { CatalogAttribute, AttributeTypeName } from "./types";

export type SpecDisplayValue = {
  attributeId: string;
  optionLabel?: string | null;
  optionLabels?: string[] | null;
  numberValue?: number | null;
  textValue?: string | null;
  booleanValue?: boolean | null;
  unit?: string | null;
  type?: AttributeTypeName | null;
};

export function formatSpecCell(
  attribute: CatalogAttribute,
  spec: SpecDisplayValue | undefined,
  yesLabel = "Так",
  noLabel = "Ні",
  emptyLabel = "—"
): string {
  if (!spec) return emptyLabel;
  if (attribute.type === "SELECT") {
    return spec.optionLabel?.trim() || emptyLabel;
  }
  if (attribute.type === "MULTI_SELECT") {
    const labels = (spec.optionLabels ?? [])
      .map((label) => label.trim())
      .filter(Boolean);
    if (labels.length === 0) return emptyLabel;
    return labels.join(", ");
  }
  if (attribute.type === "TEXT") {
    return spec.textValue?.trim() || emptyLabel;
  }
  if (attribute.type === "NUMBER" || attribute.type === "YEAR") {
    if (spec.numberValue == null || !Number.isFinite(spec.numberValue)) {
      return emptyLabel;
    }
    const raw =
      attribute.type === "YEAR"
        ? String(Math.round(spec.numberValue))
        : String(spec.numberValue);
    const unit = attribute.unit ?? spec.unit;
    return unit ? `${raw} ${unit}` : raw;
  }
  if (attribute.type === "BOOLEAN") {
    if (spec.booleanValue == null) return emptyLabel;
    return spec.booleanValue ? yesLabel : noLabel;
  }
  return emptyLabel;
}
