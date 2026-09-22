"use server";

import {
  fetchAttributesForNode,
  fetchDisplayGroupsForNode,
  resolveAttributesByKey,
  resolveDisplayGroupsByKey,
} from "@/lib/catalog/taxonomy";
import type {
  CatalogAttribute,
  CatalogDisplayGroup,
} from "@/lib/catalog/types";
import { getStaffUser } from "@/utils/session";

export type ProductSheetMeta = {
  attributes: CatalogAttribute[];
  nameFromDisplayGroup: boolean;
  nameWriterGroup: CatalogDisplayGroup | null;
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
    };
  }
  const [attributes, displayGroups] = await Promise.all([
    fetchAttributesForNode(nodeId).then(resolveAttributesByKey),
    fetchDisplayGroupsForNode(nodeId).then(resolveDisplayGroupsByKey),
  ]);
  const writers = displayGroups.filter((group) => group.writesProductName);
  const nameWriterGroup =
    writers.find((group) => !group.inherited) ?? writers[0] ?? null;
  return {
    attributes,
    nameFromDisplayGroup: Boolean(nameWriterGroup),
    nameWriterGroup,
  };
}
