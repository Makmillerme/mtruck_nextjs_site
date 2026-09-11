"use server";

import db from "@/utils/db";
import { getAdminUser } from "@/utils/session";
import { validateWithZodSchema } from "@/utils/schemas";
import {
  attributeIdSchema,
  createAttributeOptionSchema,
  createAttributeSchema,
  createTaxonomyNodeSchema,
  nodeIdSchema,
  optionIdSchema,
  renameTaxonomyNodeSchema,
  updateAttributeFlagsSchema,
} from "@/utils/taxonomy-schema";
import { keyify, slugify, uniqueSlug } from "@/lib/catalog/slug";
import {
  countNodeChildren,
  countNodeProducts,
  getPathNodes,
} from "@/lib/catalog/taxonomy";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import type { actionFunction } from "@/utils/types";

function checkbox(formData: FormData, name: string) {
  const value = formData.get(name);
  return value === "true" || value === "on";
}

async function renderTaxonomyError(error: unknown): Promise<{ message: string }> {
  console.error(error);
  if (error instanceof Error && error.message) {
    return { message: error.message };
  }
  const t = await getTranslations("Actions");
  return { message: t("error") };
}

function revalidateCatalog() {
  revalidatePath("/admin/catalog");
  revalidatePath("/admin/products/create");
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

async function uniqueOptionSlug(attributeId: string, label: string) {
  return uniqueSlug(label, async (slug) => {
    const found = await db.attributeOption.findUnique({
      where: { attributeId_slug: { attributeId, slug } },
    });
    return Boolean(found);
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
  if (!parent || !pathIds.has(parent.taxonomyNodeId)) {
    const t = await getTranslations("CatalogAdmin");
    throw new Error(t("invalidDependsOn"));
  }
  if (parent.type !== "SELECT") {
    const t = await getTranslations("CatalogAdmin");
    throw new Error(t("dependsOnMustBeSelect"));
  }
}

export const createTaxonomyNodeAction: actionFunction = async (_prev, formData) => {
  await getAdminUser();
  try {
    const data = validateWithZodSchema(createTaxonomyNodeSchema, {
      name: formData.get("name"),
      parentId: formData.get("parentId") ?? undefined,
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
      },
    });
    revalidateCatalog();
    const t = await getTranslations("CatalogAdmin");
    return { message: t("folderCreated") };
  } catch (error) {
    return renderTaxonomyError(error);
  }
};

export const renameTaxonomyNodeAction: actionFunction = async (_prev, formData) => {
  await getAdminUser();
  try {
    const data = validateWithZodSchema(renameTaxonomyNodeSchema, {
      nodeId: formData.get("nodeId"),
      name: formData.get("name"),
    });
    await db.taxonomyNode.update({
      where: { id: data.nodeId },
      data: { name: data.name },
    });
    revalidateCatalog();
    const t = await getTranslations("CatalogAdmin");
    return { message: t("folderRenamed") };
  } catch (error) {
    return renderTaxonomyError(error);
  }
};

export const deleteTaxonomyNodeAction: actionFunction = async (_prev, formData) => {
  await getAdminUser();
  try {
    const data = validateWithZodSchema(nodeIdSchema, {
      nodeId: formData.get("nodeId"),
    });
    const t = await getTranslations("CatalogAdmin");
    const [childCount, productCount] = await Promise.all([
      countNodeChildren(data.nodeId),
      countNodeProducts(data.nodeId),
    ]);
    if (childCount > 0) throw new Error(t("folderHasChildren"));
    if (productCount > 0) throw new Error(t("folderHasProducts"));
    await db.taxonomyNode.delete({ where: { id: data.nodeId } });
    revalidateCatalog();
    return { message: t("folderDeleted") };
  } catch (error) {
    return renderTaxonomyError(error);
  }
};

export const createAttributeAction: actionFunction = async (_prev, formData) => {
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
      isIdentity: checkbox(formData, "isIdentity"),
    });
    await assertDependsOnAllowed(data.taxonomyNodeId, data.dependsOnAttributeId);
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
        dependsOnAttributeId: data.dependsOnAttributeId ?? null,
        unit: data.unit ?? null,
        isRequired: data.isRequired,
        isFacet: data.isFacet,
        isIdentity: data.isIdentity,
        sortOrder: await nextAttributeSort(data.taxonomyNodeId),
      },
    });
    revalidateCatalog();
    const t = await getTranslations("CatalogAdmin");
    return { message: t("fieldCreated") };
  } catch (error) {
    return renderTaxonomyError(error);
  }
};

export const updateAttributeAction: actionFunction = async (_prev, formData) => {
  await getAdminUser();
  try {
    const data = validateWithZodSchema(updateAttributeFlagsSchema, {
      attributeId: formData.get("attributeId"),
      name: formData.get("name"),
      unit: formData.get("unit") ?? undefined,
      isRequired: checkbox(formData, "isRequired"),
      isFacet: checkbox(formData, "isFacet"),
      isIdentity: checkbox(formData, "isIdentity"),
    });
    await db.attributeDefinition.update({
      where: { id: data.attributeId },
      data: {
        name: data.name,
        unit: data.unit ?? null,
        isRequired: data.isRequired,
        isFacet: data.isFacet,
        isIdentity: data.isIdentity,
      },
    });
    revalidateCatalog();
    const t = await getTranslations("CatalogAdmin");
    return { message: t("fieldUpdated") };
  } catch (error) {
    return renderTaxonomyError(error);
  }
};

export const deleteAttributeAction: actionFunction = async (_prev, formData) => {
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
    return { message: t("fieldDeleted") };
  } catch (error) {
    return renderTaxonomyError(error);
  }
};

export const createAttributeOptionAction: actionFunction = async (_prev, formData) => {
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
    if (attribute.type !== "SELECT") throw new Error(t("optionsOnlySelect"));
    if (attribute.dependsOnAttributeId) {
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
    return { message: t("optionCreated") };
  } catch (error) {
    return renderTaxonomyError(error);
  }
};

export const deleteAttributeOptionAction: actionFunction = async (_prev, formData) => {
  await getAdminUser();
  try {
    const data = validateWithZodSchema(optionIdSchema, {
      optionId: formData.get("optionId"),
    });
    await db.attributeOption.delete({ where: { id: data.optionId } });
    revalidateCatalog();
    const t = await getTranslations("CatalogAdmin");
    return { message: t("optionDeleted") };
  } catch (error) {
    return renderTaxonomyError(error);
  }
};
