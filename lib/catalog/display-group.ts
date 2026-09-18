import type { CatalogDisplayGroup } from "./types";
import type { SpecCreateInput } from "./product-specs";
import {
  fetchDisplayGroupsForNode,
  resolveDisplayGroupsByKey,
} from "./taxonomy";

type SpecValueSource = SpecCreateInput & {
  optionLabel?: string | null;
};

function formatSpecPart(
  member: CatalogDisplayGroup["members"][number],
  spec: SpecValueSource | undefined
): string | null {
  if (!spec) return null;
  const { attribute } = member;
  if (attribute.type === "SELECT") {
    const label = spec.optionLabel?.trim();
    return label || null;
  }
  if (attribute.type === "TEXT") {
    const text = spec.textValue?.trim();
    return text || null;
  }
  if (attribute.type === "NUMBER" || attribute.type === "YEAR") {
    if (spec.numberValue == null || !Number.isFinite(spec.numberValue)) {
      return null;
    }
    const raw =
      attribute.type === "YEAR"
        ? String(Math.round(spec.numberValue))
        : String(spec.numberValue);
    return attribute.unit ? `${raw} ${attribute.unit}` : raw;
  }
  if (attribute.type === "BOOLEAN") {
    if (spec.booleanValue == null) return null;
    return spec.booleanValue ? attribute.name : null;
  }
  return null;
}

export function resolveDisplayGroupString(
  group: CatalogDisplayGroup,
  specs: SpecValueSource[]
): string {
  const byAttribute = new Map(specs.map((spec) => [spec.attributeId, spec]));
  const parts: string[] = [];
  for (const member of group.members) {
    const part = formatSpecPart(member, byAttribute.get(member.attributeId));
    if (part) parts.push(part);
  }
  return parts.join(group.separator || " ").trim();
}

export async function resolveProductNameFromDisplayGroups(
  nodeId: string,
  specs: SpecValueSource[]
): Promise<string | null> {
  const groups = resolveDisplayGroupsByKey(
    await fetchDisplayGroupsForNode(nodeId)
  );
  const writer = groups.find((group) => group.writesProductName);
  if (!writer) return null;
  const value = resolveDisplayGroupString(writer, specs);
  return value.length > 0 ? value : null;
}
