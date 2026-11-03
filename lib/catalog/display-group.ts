import type { CatalogAttribute, CatalogDisplayGroup } from "./types";
import type { SpecCreateInput } from "./product-specs";
import {
  collectSubtreeIds,
  fetchDisplayGroupsForNode,
  resolveDisplayGroupsByKey,
} from "./taxonomy";
import db from "@/utils/db";

type SpecValueSource = SpecCreateInput & {
  optionLabel?: string | null;
};

export const FORMATION_TARGET_NAME = "name";

export function formationTargetKey(
  group: Pick<CatalogDisplayGroup, "writesProductName" | "targetAttributeId">
): string | null {
  if (group.targetAttributeId) return `attr:${group.targetAttributeId}`;
  if (group.writesProductName) return FORMATION_TARGET_NAME;
  return null;
}

/** Closest folder wins per formation target (name or TEXT attribute). */
export function resolveFormationTemplates(
  groups: CatalogDisplayGroup[]
): CatalogDisplayGroup[] {
  const byTarget = new Map<string, CatalogDisplayGroup>();
  for (const group of groups) {
    const key = formationTargetKey(group);
    if (!key) continue;
    byTarget.set(key, group);
  }
  return [...byTarget.values()];
}

export function isActiveFormationTemplate(
  group: CatalogDisplayGroup | null | undefined
): group is CatalogDisplayGroup {
  return Boolean(group && formationTargetKey(group) && group.members.length > 0);
}

export function resolveNameFormationTemplate(
  groups: CatalogDisplayGroup[]
): CatalogDisplayGroup | null {
  const templates = resolveFormationTemplates(groups);
  const nameTemplate =
    templates.find(
      (group) => group.writesProductName && !group.targetAttributeId
    ) ?? null;
  return isActiveFormationTemplate(nameTemplate) ? nameTemplate : null;
}

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

export type FormationApplyResult = {
  name: string | null;
  attributeTextValues: Map<string, string>;
};

export async function applyFormationTemplates(
  nodeId: string,
  specs: SpecValueSource[]
): Promise<FormationApplyResult> {
  const templates = resolveFormationTemplates(
    await fetchDisplayGroupsForNode(nodeId)
  );
  let name: string | null = null;
  const attributeTextValues = new Map<string, string>();
  for (const template of templates) {
    if (template.members.length === 0) continue;
    const value = resolveDisplayGroupString(template, specs);
    if (!value) continue;
    if (template.targetAttributeId) {
      attributeTextValues.set(template.targetAttributeId, value);
    } else if (template.writesProductName) {
      name = value;
    }
  }
  return { name, attributeTextValues };
}

export async function resolveProductNameFromDisplayGroups(
  nodeId: string,
  specs: SpecValueSource[]
): Promise<string | null> {
  const { name } = await applyFormationTemplates(nodeId, specs);
  return name;
}

/** Recompute Product.name and TEXT formation targets in the folder subtree. */
export async function regenerateFormationInFolderSubtree(
  nodeId: string
): Promise<{ updatedNames: number; updatedSpecs: number; skipped: number }> {
  const folderIds = await collectSubtreeIds(nodeId);
  const products = await db.product.findMany({
    where: {
      taxonomyNodeId: { in: folderIds },
      archivedAt: null,
    },
    select: {
      id: true,
      name: true,
      taxonomyNodeId: true,
      specs: {
        select: {
          id: true,
          attributeId: true,
          optionId: true,
          numberValue: true,
          textValue: true,
          booleanValue: true,
          option: { select: { label: true } },
        },
      },
    },
  });

  let updatedNames = 0;
  let updatedSpecs = 0;
  let skipped = 0;
  for (const product of products) {
    if (!product.taxonomyNodeId) {
      skipped += 1;
      continue;
    }
    const specs: SpecValueSource[] = product.specs.map((spec) => ({
      attributeId: spec.attributeId,
      optionId: spec.optionId,
      optionLabel: spec.option?.label ?? null,
      numberValue: spec.numberValue,
      textValue: spec.textValue,
      booleanValue: spec.booleanValue,
    }));
    const applied = await applyFormationTemplates(
      product.taxonomyNodeId,
      specs
    );

    let touched = false;
    if (applied.name && applied.name !== product.name) {
      await db.product.update({
        where: { id: product.id },
        data: { name: applied.name },
      });
      updatedNames += 1;
      touched = true;
    }

    for (const [attributeId, textValue] of applied.attributeTextValues) {
      const existing = product.specs.find(
        (spec) => spec.attributeId === attributeId
      );
      if (existing) {
        if (existing.textValue === textValue) continue;
        await db.productSpec.update({
          where: { id: existing.id },
          data: {
            textValue,
            optionId: null,
            numberValue: null,
            booleanValue: null,
          },
        });
        updatedSpecs += 1;
        touched = true;
      } else {
        await db.productSpec.create({
          data: {
            productId: product.id,
            attributeId,
            textValue,
          },
        });
        updatedSpecs += 1;
        touched = true;
      }
    }

    if (!touched) skipped += 1;
  }
  return { updatedNames, updatedSpecs, skipped };
}

/** @deprecated Prefer regenerateFormationInFolderSubtree */
export async function regenerateProductNamesInFolderSubtree(
  nodeId: string
): Promise<{ updated: number; skipped: number }> {
  const result = await regenerateFormationInFolderSubtree(nodeId);
  return { updated: result.updatedNames, skipped: result.skipped };
}

export async function resolveProductNameWithExtra(
  nodeId: string,
  specs: SpecValueSource[],
  affix?: { prefix?: string | null; suffix?: string | null }
): Promise<string | null> {
  const groups = resolveDisplayGroupsByKey(
    await fetchDisplayGroupsForNode(nodeId)
  );
  const writer = resolveNameFormationTemplate(groups);
  if (!writer) return null;
  const composed = resolveDisplayGroupString(writer, specs);
  const joined = joinProductName(
    affix?.prefix ?? "",
    composed,
    affix?.suffix ?? ""
  );
  return joined.length > 0 ? joined : null;
}

/** Merge formation TEXT targets into parsed specs (empty or previous auto). */
export function mergeFormationIntoSpecs(
  specs: SpecCreateInput[],
  attributeTextValues: Map<string, string>,
  previousByAttribute?: Map<string, string | null>
): SpecCreateInput[] {
  if (attributeTextValues.size === 0) return specs;
  const byId = new Map(specs.map((spec) => [spec.attributeId, { ...spec }]));
  for (const [attributeId, textValue] of attributeTextValues) {
    const existing = byId.get(attributeId);
    const currentText = existing?.textValue?.trim() ?? "";
    const previous = previousByAttribute?.get(attributeId)?.trim() ?? "";
    const shouldWrite =
      currentText.length === 0 ||
      currentText === previous ||
      currentText === textValue;
    if (!shouldWrite) continue;
    byId.set(attributeId, {
      attributeId,
      textValue,
      optionId: null,
      numberValue: null,
      booleanValue: null,
    });
  }
  return [...byId.values()];
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
    if (attribute.type === "MULTI_SELECT") {
      if (!raw?.trim()) continue;
      const optionIds = raw
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean)
        .filter((id) => attribute.options.some((option) => option.id === id));
      if (optionIds.length === 0) continue;
      specs.push({ attributeId: attribute.id, optionIds });
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
