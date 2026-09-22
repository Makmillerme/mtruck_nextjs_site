import type { CatalogAttribute, CatalogDisplayGroup } from "./types";
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

export type DisplayGroupPart = {
  attributeId: string;
  name: string;
  value: string | null;
};

export function resolveDisplayGroupParts(
  group: CatalogDisplayGroup,
  specs: SpecValueSource[] = []
): DisplayGroupPart[] {
  const byAttribute = new Map(specs.map((spec) => [spec.attributeId, spec]));
  return group.members.map((member) => ({
    attributeId: member.attributeId,
    name: member.attribute.name,
    value: formatSpecPart(member, byAttribute.get(member.attributeId)),
  }));
}

export function resolveDisplayGroupString(
  group: CatalogDisplayGroup,
  specs: SpecValueSource[]
): string {
  const parts: string[] = [];
  for (const part of resolveDisplayGroupParts(group, specs)) {
    if (part.value) parts.push(part.value);
  }
  return parts.join(group.separator || " ").trim();
}

/** Free text before/after composed tags; joins non-empty parts with a single space. */
export function joinProductName(
  prefix: string,
  composed: string,
  suffix: string
): string {
  return [prefix, composed, suffix]
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .join(" ");
}

export function splitProductNameAroundComposed(
  full: string,
  composed: string
): { prefix: string; suffix: string } {
  const composedTrimmed = composed.trim();
  if (!composedTrimmed) return { prefix: "", suffix: "" };
  const index = full.indexOf(composedTrimmed);
  if (index < 0) return { prefix: "", suffix: "" };
  return {
    prefix: full.slice(0, index).trim(),
    suffix: full.slice(index + composedTrimmed.length).trim(),
  };
}

export async function resolveProductNameFromDisplayGroups(
  nodeId: string,
  specs: SpecValueSource[]
): Promise<string | null> {
  const groups = resolveDisplayGroupsByKey(
    await fetchDisplayGroupsForNode(nodeId)
  );
  const writers = groups.filter((group) => group.writesProductName);
  const writer =
    writers.find((group) => !group.inherited) ?? writers[0] ?? null;
  if (!writer) return null;
  const value = resolveDisplayGroupString(writer, specs);
  return value.length > 0 ? value : null;
}

export async function resolveProductNameWithExtra(
  nodeId: string,
  specs: SpecValueSource[],
  affix?: { prefix?: string | null; suffix?: string | null }
): Promise<string | null> {
  const groups = resolveDisplayGroupsByKey(
    await fetchDisplayGroupsForNode(nodeId)
  );
  const writers = groups.filter((group) => group.writesProductName);
  const writer =
    writers.find((group) => !group.inherited) ?? writers[0] ?? null;
  if (!writer) return null;
  const composed = resolveDisplayGroupString(writer, specs);
  const joined = joinProductName(
    affix?.prefix ?? "",
    composed,
    affix?.suffix ?? ""
  );
  return joined.length > 0 ? joined : null;
}

/** Build compose inputs from sheet controlled values (option id / text / number / bool). */
export function specsFromSheetValues(
  attributes: CatalogAttribute[],
  values: Record<string, string>
): SpecValueSource[] {
  const specs: SpecValueSource[] = [];
  for (const attribute of attributes) {
    const raw = values[attribute.id];
    if (attribute.type === "SELECT") {
      if (!raw) continue;
      const option = attribute.options.find((item) => item.id === raw);
      if (!option) continue;
      specs.push({
        attributeId: attribute.id,
        optionId: option.id,
        optionLabel: option.label,
      });
      continue;
    }
    if (attribute.type === "TEXT") {
      const textValue = raw?.trim();
      if (!textValue) continue;
      specs.push({ attributeId: attribute.id, textValue });
      continue;
    }
    if (attribute.type === "NUMBER" || attribute.type === "YEAR") {
      if (!raw?.trim()) continue;
      const numberValue = Number(raw);
      if (!Number.isFinite(numberValue)) continue;
      specs.push({ attributeId: attribute.id, numberValue });
      continue;
    }
    if (attribute.type === "BOOLEAN") {
      specs.push({
        attributeId: attribute.id,
        booleanValue: raw === "true",
      });
    }
  }
  return specs;
}
