"use server";

import db from "@/utils/db";
import { getAdminUser, getStaffUser } from "@/utils/session";
import { validateWithZodSchema } from "@/utils/schemas";
import {
  attributeIdSchema,
  createAttributeOptionSchema,
  createAttributeSchema,
  updateAttributeOptionSchema,
  createDisplayGroupSchema,
  createTaxonomyNodeSchema,
  displayGroupIdSchema,
  saveProductNameTemplateSchema,
  moveTaxonomyNodeSchema,
  nodeIdSchema,
  optionIdSchema,
  renameTaxonomyNodeSchema,
  updateAttributeSchema,
  updateDisplayGroupSchema,
} from "@/utils/taxonomy-schema";
import { keyify, uniqueSlug } from "@/lib/catalog/slug";
import { attributeHasOptions } from "@/lib/catalog/types";
import {
  regenerateFormationInFolderSubtree,
  resolveFormationTemplates,
} from "@/lib/catalog/display-group";
import { fetchDisplayGroupsForNode } from "@/lib/catalog/taxonomy";
import {
  fetchSiblingNodes,
  getPathNodes,
  getSubtreeStats,
} from "@/lib/catalog/taxonomy";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { revalidatePublicCatalog } from "@/lib/catalog/cache";
import type { TaxonomyAction, TaxonomyActionState } from "@/utils/taxonomy-action-state";

function checkbox(formData: FormData, name: string) {
  const value = formData.get(name);
  return value === "true" || value === "on";
}

async function renderTaxonomyError(error: unknown): Promise<TaxonomyActionState> {
  console.error(error);
  if (error instanceof Error && error.message) {
    return { message: error.message, ok: false };
  }
  const t = await getTranslations("Actions");
  return { message: t("error"), ok: false };
}

function revalidateCatalog() {
  revalidatePath("/admin");
  revalidatePath("/admin/catalog");
  revalidatePath("/admin/ui");
  revalidatePath("/admin/products");
  revalidatePath("/admin/products/create");
  revalidatePublicCatalog();
}

async function uniqueNodeSlug(name: string) {
  return uniqueSlug(name, async (slug) => {
    const found = await db.taxonomyNode.findUnique({ where: { slug } });
    return Boolean(found);
  });
}

async function uniqueAttributeKey(taxonomyNodeId: string, name: string) {
  const root = keyify(name);
  let key = root;
  let n = 2;
  while (
    await db.attributeDefinition.findUnique({
      where: { taxonomyNodeId_key: { taxonomyNodeId, key } },
    })
  ) {
    key = `${root}_${n}`;
    n += 1;
  }
  return key;
}

async function uniqueOptionSlug(
  attributeId: string,
  label: string,
  excludeOptionId?: string
) {
  return uniqueSlug(label, async (slug) => {
    const found = await db.attributeOption.findUnique({
      where: { attributeId_slug: { attributeId, slug } },
    });
    if (!found) return false;
    return found.id !== excludeOptionId;
  });
}

async function nextSiblingSort(parentId: string | null) {
  const aggregate = await db.taxonomyNode.aggregate({
    where: { parentId },
    _max: { sortOrder: true },
  });
  return (aggregate._max.sortOrder ?? -1) + 1;
}

async function nextAttributeSort(taxonomyNodeId: string) {
  const aggregate = await db.attributeDefinition.aggregate({
    where: { taxonomyNodeId },
    _max: { sortOrder: true },
  });
  return (aggregate._max.sortOrder ?? -1) + 1;
}

async function nextDisplayGroupSort(taxonomyNodeId: string) {
  const aggregate = await db.displayGroup.aggregate({
    where: { taxonomyNodeId },
    _max: { sortOrder: true },
  });
  return (aggregate._max.sortOrder ?? -1) + 1;
}

async function uniqueDisplayGroupKey(taxonomyNodeId: string, name: string) {
  const root = keyify(name);
  let key = root;
  let n = 2;
  while (
    await db.displayGroup.findUnique({
      where: { taxonomyNodeId_key: { taxonomyNodeId, key } },
    })
  ) {
    key = `${root}_${n}`;
    n += 1;
  }
  return key;
}

function memberAttributeIdsFromForm(formData: FormData) {
  return formData
    .getAll("memberAttributeId")
    .map((value) => String(value).trim())
    .filter(Boolean);
}

async function assertMembersAllowed(
  taxonomyNodeId: string,
  memberAttributeIds: string[]
) {
  if (memberAttributeIds.length === 0) return;
  const t = await getTranslations("CatalogAdmin");
  const path = await getPathNodes(taxonomyNodeId);
  const pathIds = new Set(path.map((node) => node.id));
  const attributes = await db.attributeDefinition.findMany({
    where: { id: { in: memberAttributeIds } },
    select: { id: true, taxonomyNodeId: true },
  });
  if (attributes.length !== memberAttributeIds.length) {
    throw new Error(t("displayGroupMemberMissing"));
  }
  for (const attribute of attributes) {
    if (!pathIds.has(attribute.taxonomyNodeId)) {
      throw new Error(t("displayGroupMemberOutOfBranch"));
    }
  }
  const unique = new Set(memberAttributeIds);
  if (unique.size !== memberAttributeIds.length) {
    throw new Error(t("displayGroupMemberDuplicate"));
  }
}

const FORMATION_NAME_SENTINEL = "__name__";

function parseFormationTarget(formData: FormData): {
  writesProductName: boolean;
  targetAttributeId: string | null;
} {
  const raw = String(formData.get("targetAttributeId") ?? "").trim();
  if (!raw || raw === FORMATION_NAME_SENTINEL) {
    return { writesProductName: true, targetAttributeId: null };
  }
  return { writesProductName: false, targetAttributeId: raw };
}

async function assertFormationTarget(
  taxonomyNodeId: string,
  writesProductName: boolean,
  targetAttributeId: string | null,
  memberAttributeIds: string[],
  excludeGroupId?: string
) {
  const t = await getTranslations("CatalogAdmin");
  if (!writesProductName && !targetAttributeId) {
    throw new Error(t("formationTargetRequired"));
  }
  if (writesProductName && targetAttributeId) {
    throw new Error(t("formationTargetInvalid"));
  }
  if (targetAttributeId && memberAttributeIds.includes(targetAttributeId)) {
    throw new Error(t("formationTargetNotMember"));
  }

  if (targetAttributeId) {
    const path = await getPathNodes(taxonomyNodeId);
    const pathIds = new Set(path.map((node) => node.id));
    const attribute = await db.attributeDefinition.findUnique({
      where: { id: targetAttributeId },
      select: { id: true, type: true, taxonomyNodeId: true },
    });
    if (!attribute || !pathIds.has(attribute.taxonomyNodeId)) {
      throw new Error(t("formationTargetMissing"));
    }
    if (attribute.type !== "TEXT") {
      throw new Error(t("formationTargetMustBeText"));
    }
  }

  const existing = await db.displayGroup.findMany({
    where: {
      taxonomyNodeId,
      ...(excludeGroupId ? { NOT: { id: excludeGroupId } } : {}),
      OR: targetAttributeId
        ? [{ targetAttributeId }]
        : [{ writesProductName: true, targetAttributeId: null }],
    },
    select: { id: true },
  });
  if (existing.length > 0) {
    throw new Error(t("formationTargetDuplicate"));
  }

  // Block direct cycles A→B→A among TEXT formation targets on this folder path.
  if (targetAttributeId && memberAttributeIds.length > 0) {
    const templates = resolveFormationTemplates(
      await fetchDisplayGroupsForNode(taxonomyNodeId)
    );
    for (const memberId of memberAttributeIds) {
      const other = templates.find((group) => group.targetAttributeId === memberId);
      if (!other) continue;
      if (
        other.members.some((member) => member.attributeId === targetAttributeId)
      ) {
        throw new Error(t("formationTargetCycle"));
      }
    }
  }
}

async function nextOptionSort(attributeId: string, parentOptionId: string | null) {
  const aggregate = await db.attributeOption.aggregate({
    where: { attributeId, parentOptionId },
    _max: { sortOrder: true },
  });
  return (aggregate._max.sortOrder ?? -1) + 1;
}

async function assertDependsOnAllowed(
  taxonomyNodeId: string,
  dependsOnAttributeId: string | undefined
) {
  if (!dependsOnAttributeId) return;
  const path = await getPathNodes(taxonomyNodeId);
  const pathIds = new Set(path.map((node) => node.id));
  const parent = await db.attributeDefinition.findUnique({
    where: { id: dependsOnAttributeId },
  });
  const t = await getTranslations("CatalogAdmin");
  if (!parent || !pathIds.has(parent.taxonomyNodeId)) {
    throw new Error(t("invalidDependsOn"));
  }
  if (parent.type !== "SELECT") {
    throw new Error(t("dependsOnMustBeSelect"));
  }
}

export const createTaxonomyNodeAction: TaxonomyAction = async (_prev, formData) => {
  await getAdminUser();
  try {
    const data = validateWithZodSchema(createTaxonomyNodeSchema, {
      name: formData.get("name"),
      parentId: formData.get("parentId") ?? undefined,
      showInFilter: checkbox(formData, "showInFilter"),
      showInHomeFilter: checkbox(formData, "showInHomeFilter"),
    });
    if (data.parentId) {
      const parent = await db.taxonomyNode.findUnique({
        where: { id: data.parentId },
      });
      if (!parent) {
        const t = await getTranslations("CatalogAdmin");
        throw new Error(t("parentMissing"));
      }
    }
    await db.taxonomyNode.create({
      data: {
        name: data.name,
        slug: await uniqueNodeSlug(data.name),
        parentId: data.parentId ?? null,
        sortOrder: await nextSiblingSort(data.parentId ?? null),
        showInFilter: data.showInFilter,
        showInHomeFilter: data.showInHomeFilter,
      },
    });
    revalidateCatalog();
    const t = await getTranslations("CatalogAdmin");
    return { message: t("folderCreated"), ok: true };
  } catch (error) {
    return renderTaxonomyError(error);
  }
};

export const renameTaxonomyNodeAction: TaxonomyAction = async (_prev, formData) => {
  await getAdminUser();
  try {
    const data = validateWithZodSchema(renameTaxonomyNodeSchema, {
      nodeId: formData.get("nodeId"),
      name: formData.get("name"),
      showInFilter: checkbox(formData, "showInFilter"),
      showInHomeFilter: checkbox(formData, "showInHomeFilter"),
    });
    await db.taxonomyNode.update({
      where: { id: data.nodeId },
      data: {
        name: data.name,
        showInFilter: data.showInFilter,
        showInHomeFilter: data.showInHomeFilter,
      },
    });
    revalidateCatalog();
    const t = await getTranslations("CatalogAdmin");
    return { message: t("folderRenamed"), ok: true };
  } catch (error) {
    return renderTaxonomyError(error);
  }
};

/** Sibling order drives both the admin tree and, later, the public filter order. */
export const moveTaxonomyNodeAction: TaxonomyAction = async (_prev, formData) => {
  await getAdminUser();
  try {
    const data = validateWithZodSchema(moveTaxonomyNodeSchema, {
      nodeId: formData.get("nodeId"),
      direction: formData.get("direction"),
    });
    const t = await getTranslations("CatalogAdmin");
    const node = await db.taxonomyNode.findUnique({
      where: { id: data.nodeId },
      select: { id: true, parentId: true },
    });
    if (!node) throw new Error(t("folderMissing"));

    const siblings = await fetchSiblingNodes(node.parentId);
    const index = siblings.findIndex((item) => item.id === node.id);
    const targetIndex = data.direction === "up" ? index - 1 : index + 1;
    if (index === -1 || targetIndex < 0 || targetIndex >= siblings.length) {
      return { message: "", ok: true };
    }

    const reordered = [...siblings];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    await db.$transaction(
      reordered.map((item, position) =>
        db.taxonomyNode.update({
          where: { id: item.id },
          data: { sortOrder: position },
        })
      )
    );
    revalidateCatalog();
    return { message: "", ok: true };
  } catch (error) {
    return renderTaxonomyError(error);
  }
};

/** Children and their fields go with the folder; listings block the delete instead. */
export const deleteTaxonomyNodeAction: TaxonomyAction = async (_prev, formData) => {
  await getAdminUser();
  try {
    const data = validateWithZodSchema(nodeIdSchema, {
      nodeId: formData.get("nodeId"),
    });
    const t = await getTranslations("CatalogAdmin");
    const stats = await getSubtreeStats(data.nodeId);
    if (stats.productCount > 0) {
      throw new Error(t("folderHasProducts", { count: stats.productCount }));
    }
    await db.taxonomyNode.delete({ where: { id: data.nodeId } });
    revalidateCatalog();
    return { message: t("folderDeleted"), ok: true };
  } catch (error) {
    return renderTaxonomyError(error);
  }
};

export const createAttributeAction: TaxonomyAction = async (_prev, formData) => {
  await getAdminUser();
  try {
    const data = validateWithZodSchema(createAttributeSchema, {
      taxonomyNodeId: formData.get("taxonomyNodeId"),
      name: formData.get("name"),
      key: formData.get("key") ?? undefined,
      type: formData.get("type"),
      dependsOnAttributeId: formData.get("dependsOnAttributeId") ?? undefined,
      unit: formData.get("unit") ?? undefined,
      isRequired: checkbox(formData, "isRequired"),
      isFacet: checkbox(formData, "isFacet"),
      showInHomeFilter: checkbox(formData, "showInHomeFilter"),
      sheetWidth: formData.get("sheetWidth") ?? "FULL",
      textInput: formData.get("textInput") ?? "LINE",
    });
    const dependsOn =
      data.type === "SELECT" ? data.dependsOnAttributeId : undefined;
    await assertDependsOnAllowed(data.taxonomyNodeId, dependsOn);
    const key = await uniqueAttributeKey(
      data.taxonomyNodeId,
      data.key ?? data.name
    );
    await db.attributeDefinition.create({
      data: {
        taxonomyNodeId: data.taxonomyNodeId,
        name: data.name,
        key,
        type: data.type,
        dependsOnAttributeId: dependsOn ?? null,
        unit: data.unit ?? null,
        isRequired: data.isRequired,
        isFacet: data.isFacet,
        showInHomeFilter: data.showInHomeFilter,
        sheetWidth: data.sheetWidth,
        textInput: data.type === "TEXT" ? data.textInput : "LINE",
        sortOrder: await nextAttributeSort(data.taxonomyNodeId),
      },
    });
    revalidateCatalog();
    const t = await getTranslations("CatalogAdmin");
    return { message: t("fieldCreated"), ok: true };
  } catch (error) {
    return renderTaxonomyError(error);
  }
};

export const updateAttributeAction: TaxonomyAction = async (_prev, formData) => {
  await getAdminUser();
  try {
    const data = validateWithZodSchema(updateAttributeSchema, {
      attributeId: formData.get("attributeId"),
      name: formData.get("name"),
      type: formData.get("type"),
      dependsOnAttributeId: formData.get("dependsOnAttributeId") ?? undefined,
      unit: formData.get("unit") ?? undefined,
      isRequired: checkbox(formData, "isRequired"),
      isFacet: checkbox(formData, "isFacet"),
      showInHomeFilter: checkbox(formData, "showInHomeFilter"),
      sheetWidth: formData.get("sheetWidth") ?? "FULL",
      textInput: formData.get("textInput") ?? "LINE",
    });
    const t = await getTranslations("CatalogAdmin");
    const existing = await db.attributeDefinition.findUnique({
      where: { id: data.attributeId },
    });
    if (!existing) throw new Error(t("fieldMissing"));

    const nextType = data.type;
    const nextDependsOn =
      nextType === "SELECT" ? (data.dependsOnAttributeId ?? null) : null;

    if (nextDependsOn === data.attributeId) {
      throw new Error(t("invalidDependsOn"));
    }

    await assertDependsOnAllowed(
      existing.taxonomyNodeId,
      nextDependsOn ?? undefined
    );

    if (nextType !== "SELECT") {
      const dependents = await db.attributeDefinition.count({
        where: { dependsOnAttributeId: data.attributeId },
      });
      if (dependents > 0) throw new Error(t("fieldHasDependents"));
    }

    const structureChanged =
      existing.type !== nextType ||
      (existing.dependsOnAttributeId ?? null) !== nextDependsOn;
    const keepOptions =
      attributeHasOptions(existing.type) && attributeHasOptions(nextType);

    await db.$transaction(async (tx) => {
      if (structureChanged) {
        await tx.productSpec.deleteMany({ where: { attributeId: data.attributeId } });
        if (!keepOptions) {
          await tx.attributeOption.deleteMany({
            where: { attributeId: data.attributeId },
          });
        }
      }
      await tx.attributeDefinition.update({
        where: { id: data.attributeId },
        data: {
          name: data.name,
          type: nextType,
          dependsOnAttributeId: nextDependsOn,
          unit: data.unit ?? null,
          isRequired: data.isRequired,
          isFacet: data.isFacet,
          showInHomeFilter: data.showInHomeFilter,
          sheetWidth: data.sheetWidth,
          textInput: nextType === "TEXT" ? data.textInput : "LINE",
        },
      });
    });

    revalidateCatalog();
    return { message: t("fieldUpdated"), ok: true };
  } catch (error) {
    return renderTaxonomyError(error);
  }
};

export const deleteAttributeAction: TaxonomyAction = async (_prev, formData) => {
  await getAdminUser();
  try {
    const data = validateWithZodSchema(attributeIdSchema, {
      attributeId: formData.get("attributeId"),
    });
    const t = await getTranslations("CatalogAdmin");
    const dependents = await db.attributeDefinition.count({
      where: { dependsOnAttributeId: data.attributeId },
    });
    if (dependents > 0) throw new Error(t("fieldHasDependents"));
    await db.attributeDefinition.delete({ where: { id: data.attributeId } });
    revalidateCatalog();
    return { message: t("fieldDeleted"), ok: true };
  } catch (error) {
    return renderTaxonomyError(error);
  }
};

export const createAttributeOptionAction: TaxonomyAction = async (_prev, formData) => {
  await getAdminUser();
  try {
    const data = validateWithZodSchema(createAttributeOptionSchema, {
      attributeId: formData.get("attributeId"),
      label: formData.get("label"),
      parentOptionId: formData.get("parentOptionId") ?? undefined,
    });
    const t = await getTranslations("CatalogAdmin");
    const attribute = await db.attributeDefinition.findUnique({
      where: { id: data.attributeId },
    });
    if (!attribute) throw new Error(t("fieldMissing"));
    if (!attributeHasOptions(attribute.type)) {
      throw new Error(t("optionsOnlySelect"));
    }
    // MULTI_SELECT is flat (no cascade parent); SELECT may depend on another SELECT.
    if (attribute.type === "SELECT" && attribute.dependsOnAttributeId) {
      if (!data.parentOptionId) throw new Error(t("optionNeedsParent"));
      const parentOption = await db.attributeOption.findUnique({
        where: { id: data.parentOptionId },
      });
      if (!parentOption || parentOption.attributeId !== attribute.dependsOnAttributeId) {
        throw new Error(t("optionParentMismatch"));
      }
    } else if (data.parentOptionId) {
      throw new Error(t("optionParentNotAllowed"));
    }
    await db.attributeOption.create({
      data: {
        attributeId: data.attributeId,
        label: data.label,
        slug: await uniqueOptionSlug(data.attributeId, data.label),
        parentOptionId: data.parentOptionId ?? null,
        sortOrder: await nextOptionSort(
          data.attributeId,
          data.parentOptionId ?? null
        ),
      },
    });
    revalidateCatalog();
    return { message: t("optionCreated"), ok: true };
  } catch (error) {
    return renderTaxonomyError(error);
  }
};

export const updateAttributeOptionAction: TaxonomyAction = async (_prev, formData) => {
  await getAdminUser();
  try {
    const data = validateWithZodSchema(updateAttributeOptionSchema, {
      optionId: formData.get("optionId"),
      label: formData.get("label"),
      parentOptionId: formData.get("parentOptionId") ?? undefined,
    });
    const t = await getTranslations("CatalogAdmin");
    const option = await db.attributeOption.findUnique({
      where: { id: data.optionId },
      include: { attribute: true },
    });
    if (!option) throw new Error(t("optionMissing"));
    const attribute = option.attribute;
    if (!attributeHasOptions(attribute.type)) {
      throw new Error(t("optionsOnlySelect"));
    }
    if (attribute.type === "SELECT" && attribute.dependsOnAttributeId) {
      if (!data.parentOptionId) throw new Error(t("optionNeedsParent"));
      const parentOption = await db.attributeOption.findUnique({
        where: { id: data.parentOptionId },
      });
      if (
        !parentOption ||
        parentOption.attributeId !== attribute.dependsOnAttributeId
      ) {
        throw new Error(t("optionParentMismatch"));
      }
    } else if (data.parentOptionId) {
      throw new Error(t("optionParentNotAllowed"));
    }
    const slug =
      data.label === option.label
        ? option.slug
        : await uniqueOptionSlug(attribute.id, data.label, option.id);
    await db.attributeOption.update({
      where: { id: option.id },
      data: {
        label: data.label,
        slug,
        parentOptionId: data.parentOptionId ?? null,
      },
    });
    revalidateCatalog();
    return { message: t("optionUpdated"), ok: true };
  } catch (error) {
    return renderTaxonomyError(error);
  }
};

export const deleteAttributeOptionAction: TaxonomyAction = async (_prev, formData) => {
  await getAdminUser();
  try {
    const data = validateWithZodSchema(optionIdSchema, {
      optionId: formData.get("optionId"),
    });
    await db.attributeOption.delete({ where: { id: data.optionId } });
    revalidateCatalog();
    const t = await getTranslations("CatalogAdmin");
    return { message: t("optionDeleted"), ok: true };
  } catch (error) {
    return renderTaxonomyError(error);
  }
};

export const createDisplayGroupAction: TaxonomyAction = async (_prev, formData) => {
  await getAdminUser();
  try {
    const target = parseFormationTarget(formData);
    const data = validateWithZodSchema(createDisplayGroupSchema, {
      taxonomyNodeId: formData.get("taxonomyNodeId"),
      name: formData.get("name"),
      key: formData.get("key") ?? undefined,
      separator: formData.get("separator") ?? " ",
      writesProductName: target.writesProductName,
      targetAttributeId: target.targetAttributeId,
      memberAttributeIds: memberAttributeIdsFromForm(formData),
    });
    await assertMembersAllowed(data.taxonomyNodeId, data.memberAttributeIds);
    await assertFormationTarget(
      data.taxonomyNodeId,
      Boolean(data.writesProductName),
      data.targetAttributeId ?? null,
      data.memberAttributeIds
    );
    const key = await uniqueDisplayGroupKey(
      data.taxonomyNodeId,
      data.key ?? data.name
    );
    await db.displayGroup.create({
      data: {
        taxonomyNodeId: data.taxonomyNodeId,
        name: data.name,
        key,
        separator: data.separator,
        writesProductName: data.writesProductName,
        targetAttributeId: data.targetAttributeId ?? null,
        sortOrder: await nextDisplayGroupSort(data.taxonomyNodeId),
        members: {
          create: data.memberAttributeIds.map((attributeId, index) => ({
            attributeId,
            sortOrder: index,
          })),
        },
      },
    });
    const t = await getTranslations("CatalogAdmin");
    let message = t("formationTemplateCreated");
    if (data.memberAttributeIds.length > 0) {
      const { updatedNames, updatedSpecs } =
        await regenerateFormationInFolderSubtree(data.taxonomyNodeId);
      message = t("formationTemplateSavedRegenerated", {
        names: updatedNames,
        specs: updatedSpecs,
      });
    }
    revalidateCatalog();
    return { message, ok: true };
  } catch (error) {
    return renderTaxonomyError(error);
  }
};

export const updateDisplayGroupAction: TaxonomyAction = async (_prev, formData) => {
  await getAdminUser();
  try {
    const target = parseFormationTarget(formData);
    const data = validateWithZodSchema(updateDisplayGroupSchema, {
      groupId: formData.get("groupId"),
      name: formData.get("name"),
      separator: formData.get("separator") ?? " ",
      writesProductName: target.writesProductName,
      targetAttributeId: target.targetAttributeId,
      memberAttributeIds: memberAttributeIdsFromForm(formData),
    });
    const existing = await db.displayGroup.findUnique({
      where: { id: data.groupId },
      select: { id: true, taxonomyNodeId: true },
    });
    const t = await getTranslations("CatalogAdmin");
    if (!existing) throw new Error(t("displayGroupMissing"));
    await assertMembersAllowed(existing.taxonomyNodeId, data.memberAttributeIds);
    await assertFormationTarget(
      existing.taxonomyNodeId,
      Boolean(data.writesProductName),
      data.targetAttributeId ?? null,
      data.memberAttributeIds,
      existing.id
    );
    await db.$transaction([
      db.displayGroupMember.deleteMany({ where: { groupId: existing.id } }),
      db.displayGroup.update({
        where: { id: existing.id },
        data: {
          name: data.name,
          separator: data.separator,
          writesProductName: data.writesProductName,
          targetAttributeId: data.targetAttributeId ?? null,
          members: {
            create: data.memberAttributeIds.map((attributeId, index) => ({
              attributeId,
              sortOrder: index,
            })),
          },
        },
      }),
    ]);
    let message = t("formationTemplateUpdated");
    if (data.memberAttributeIds.length > 0) {
      const { updatedNames, updatedSpecs } =
        await regenerateFormationInFolderSubtree(existing.taxonomyNodeId);
      message = t("formationTemplateSavedRegenerated", {
        names: updatedNames,
        specs: updatedSpecs,
      });
    } else {
      message = t("formationTemplateCleared");
    }
    revalidateCatalog();
    return { message, ok: true };
  } catch (error) {
    return renderTaxonomyError(error);
  }
};

export const deleteDisplayGroupAction: TaxonomyAction = async (_prev, formData) => {
  await getAdminUser();
  try {
    const data = validateWithZodSchema(displayGroupIdSchema, {
      groupId: formData.get("groupId"),
    });
    await db.displayGroup.delete({ where: { id: data.groupId } });
    revalidateCatalog();
    const t = await getTranslations("CatalogAdmin");
    return { message: t("displayGroupDeleted"), ok: true };
  } catch (error) {
    return renderTaxonomyError(error);
  }
};

const PRODUCT_NAME_TEMPLATE_KEY = "product_name";

/** Upsert the single name-compose template on a folder (existing attributes only). */
export const saveProductNameTemplateAction: TaxonomyAction = async (
  _prev,
  formData
) => {
  await getStaffUser();
  try {
    const memberAttributeIds = memberAttributeIdsFromForm(formData);
    const data = validateWithZodSchema(saveProductNameTemplateSchema, {
      taxonomyNodeId: formData.get("taxonomyNodeId"),
      separator: formData.get("separator") ?? " ",
      memberAttributeIds,
    });
    const node = await db.taxonomyNode.findUnique({
      where: { id: data.taxonomyNodeId },
      select: { id: true },
    });
    const t = await getTranslations("CatalogAdmin");
    if (!node) throw new Error(t("parentMissing"));
    await assertMembersAllowed(data.taxonomyNodeId, memberAttributeIds);

    const existing =
      (await db.displayGroup.findFirst({
        where: {
          taxonomyNodeId: data.taxonomyNodeId,
          writesProductName: true,
        },
        select: { id: true },
      })) ??
      (await db.displayGroup.findUnique({
        where: {
          taxonomyNodeId_key: {
            taxonomyNodeId: data.taxonomyNodeId,
            key: PRODUCT_NAME_TEMPLATE_KEY,
          },
        },
        select: { id: true },
      }));

    // Empty members → own empty writer (blocks parent inheritance; keeps DB names).
    if (memberAttributeIds.length === 0) {
      await db.displayGroup.updateMany({
        where: {
          taxonomyNodeId: data.taxonomyNodeId,
          writesProductName: true,
          ...(existing ? { NOT: { id: existing.id } } : {}),
        },
        data: { writesProductName: false },
      });

      if (existing) {
        await db.$transaction([
          db.displayGroupMember.deleteMany({ where: { groupId: existing.id } }),
          db.displayGroup.update({
            where: { id: existing.id },
            data: {
              separator: data.separator,
              writesProductName: true,
              key: PRODUCT_NAME_TEMPLATE_KEY,
            },
          }),
        ]);
      } else {
        await db.displayGroup.create({
          data: {
            taxonomyNodeId: data.taxonomyNodeId,
            name: t("productNameTemplateGroupName"),
            key: PRODUCT_NAME_TEMPLATE_KEY,
            separator: data.separator,
            writesProductName: true,
            sortOrder: await nextDisplayGroupSort(data.taxonomyNodeId),
          },
        });
      }

      revalidateCatalog();
      revalidatePath("/admin/products");
      return { message: t("productNameTemplateCleared"), ok: true };
    }

    await db.displayGroup.updateMany({
      where: {
        taxonomyNodeId: data.taxonomyNodeId,
        writesProductName: true,
        ...(existing ? { NOT: { id: existing.id } } : {}),
      },
      data: { writesProductName: false },
    });

    if (existing) {
      await db.$transaction([
        db.displayGroupMember.deleteMany({ where: { groupId: existing.id } }),
        db.displayGroup.update({
          where: { id: existing.id },
          data: {
            separator: data.separator,
            writesProductName: true,
            members: {
              create: memberAttributeIds.map((attributeId, index) => ({
                attributeId,
                sortOrder: index,
              })),
            },
          },
        }),
      ]);
    } else {
      await db.displayGroup.create({
        data: {
          taxonomyNodeId: data.taxonomyNodeId,
          name: t("productNameTemplateGroupName"),
          key: PRODUCT_NAME_TEMPLATE_KEY,
          separator: data.separator,
          writesProductName: true,
          sortOrder: await nextDisplayGroupSort(data.taxonomyNodeId),
          members: {
            create: memberAttributeIds.map((attributeId, index) => ({
              attributeId,
              sortOrder: index,
            })),
          },
        },
      });
    }

    const { updatedNames, updatedSpecs } =
      await regenerateFormationInFolderSubtree(data.taxonomyNodeId);

    revalidateCatalog();
    revalidatePath("/admin/products");
    return {
      message: t("formationTemplateSavedRegenerated", {
        names: updatedNames,
        specs: updatedSpecs,
      }),
      ok: true,
    };
  } catch (error) {
    return renderTaxonomyError(error);
  }
};


