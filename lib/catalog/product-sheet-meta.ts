"use server";

import {
  isActiveFormationTemplate,
  resolveFormationTemplates,
  resolveNameFormationTemplate,
} from "@/lib/catalog/display-group";
import {
  fetchAttributesForNode,
  fetchDisplayGroupsForNode,
  resolveAttributesByKey,
} from "@/lib/catalog/taxonomy";
import type {
  CatalogAttribute,
  CatalogDisplayGroup,
} from "@/lib/catalog/types";
import {
  adminProductListInclude,
  mapAdminProductRow,
  type AdminProductRowDTO,
} from "@/lib/admin/product-row";
import db from "@/utils/db";
import { getStaffUser } from "@/utils/session";

export type ProductSheetMeta = {
  attributes: CatalogAttribute[];
  nameFromDisplayGroup: boolean;
  nameWriterGroup: CatalogDisplayGroup | null;
  formationTemplates: CatalogDisplayGroup[];
};

export type ProductSheetHydrate = ProductSheetMeta & {
  product: AdminProductRowDTO | null;
};

/** Lightweight meta for product create/edit sheet when folder changes (no full page RSC). */
export async function loadProductSheetMetaAction(
  nodeId: string | null
): Promise<ProductSheetMeta> {
  await getStaffUser();
  if (!nodeId) {
    return {
      attributes: [],
      nameFromDisplayGroup: false,
      nameWriterGroup: null,
      formationTemplates: [],
    };
  }
  const [attributes, displayGroups] = await Promise.all([
    fetchAttributesForNode(nodeId).then(resolveAttributesByKey),
    fetchDisplayGroupsForNode(nodeId),
  ]);
  const formationTemplates = resolveFormationTemplates(displayGroups);
  const nameWriterGroup = resolveNameFormationTemplate(formationTemplates);
  // Keep resolved name writer even when empty (blocks inheritance) for sheet parity.
  const nameResolved =
    formationTemplates.find(
      (group) => group.writesProductName && !group.targetAttributeId
    ) ?? null;
  return {
    attributes,
    nameFromDisplayGroup: isActiveFormationTemplate(nameWriterGroup),
    nameWriterGroup: nameResolved,
    formationTemplates: formationTemplates.filter(isActiveFormationTemplate),
  };
}

/** Lazy filter chrome for /admin/products — not loaded on every list GET. */
export async function loadAdminProductsFilterChromeAction(
  rootId?: string | null
): Promise<{
  schema: import("@/lib/catalog/public-filter").PublicFilterSchema;
  availability: import("@/lib/catalog/filter-availability").FilterAvailabilityIndex;
}> {
  await getStaffUser();
  const { fetchPublicFilterSchema, scopeFilterSchemaToRoot } = await import(
    "@/lib/catalog/public-filter"
  );
  const { fetchAdminFilterAvailabilityIndex } = await import(
    "@/lib/catalog/filter-availability"
  );
  const [schema, availability] = await Promise.all([
    fetchPublicFilterSchema(),
    fetchAdminFilterAvailabilityIndex(),
  ]);
  return {
    schema: scopeFilterSchemaToRoot(schema, rootId?.trim() || undefined),
    availability,
  };
}

/** Edit sheet: full product row + folder meta in one round-trip. */
export async function loadAdminProductSheetAction(
  productId: string,
  nodeId: string | null
): Promise<ProductSheetHydrate> {
  await getStaffUser();
  const [row, meta] = await Promise.all([
    db.product.findUnique({
      where: { id: productId, archivedAt: null },
      include: adminProductListInclude,
    }),
    loadProductSheetMetaAction(nodeId ?? null),
  ]);
  return {
    ...meta,
    product: row ? mapAdminProductRow(row) : null,
  };
}
