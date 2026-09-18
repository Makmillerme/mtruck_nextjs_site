import type { CatalogAttribute, AttributeTypeName } from "./types";

export type SpecDisplayValue = {
  attributeId: string;
  optionLabel?: string | null;
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
  noLabel = "—"
): string {
  if (!spec) return noLabel;
  if (attribute.type === "SELECT") {
    return spec.optionLabel?.trim() || noLabel;
  }
  if (attribute.type === "TEXT") {
    return spec.textValue?.trim() || noLabel;
  }
  if (attribute.type === "NUMBER" || attribute.type === "YEAR") {
    if (spec.numberValue == null || !Number.isFinite(spec.numberValue)) {
      return noLabel;
    }
    const raw =
      attribute.type === "YEAR"
        ? String(Math.round(spec.numberValue))
        : String(spec.numberValue);
    const unit = attribute.unit ?? spec.unit;
    return unit ? `${raw} ${unit}` : raw;
  }
  if (attribute.type === "BOOLEAN") {
    if (spec.booleanValue == null) return noLabel;
    return spec.booleanValue ? yesLabel : noLabel;
  }
  return noLabel;
}
