import type { CatalogAttribute } from "./types";

export function specInputName(
  kind: "option" | "number" | "text" | "bool",
  attributeId: string
) {
  return `spec_${kind}_${attributeId}`;
}

export function sortByDependency(attributes: CatalogAttribute[]) {
  const remaining = [...attributes];
  const ordered: CatalogAttribute[] = [];
  const seen = new Set<string>();
  while (remaining.length > 0) {
    const nextIndex = remaining.findIndex(
      (item) =>
        !item.dependsOnAttributeId || seen.has(item.dependsOnAttributeId)
    );
    const index = nextIndex === -1 ? 0 : nextIndex;
    const [next] = remaining.splice(index, 1);
    ordered.push(next);
    seen.add(next.id);
  }
  return ordered;
}

/** Senior folder first, then each folder's sortOrder (cascade stays inside its folder). */
export function sortSheetAttributes(attributes: CatalogAttribute[]) {
  const folderIds: string[] = [];
  for (const attribute of attributes) {
    if (!folderIds.includes(attribute.taxonomyNodeId)) {
      folderIds.push(attribute.taxonomyNodeId);
    }
  }
  const seen = new Set<string>();
  const ordered: CatalogAttribute[] = [];
  for (const folderId of folderIds) {
    const remaining = attributes
      .filter((item) => item.taxonomyNodeId === folderId)
      .sort(
        (a, b) =>
          a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "uk")
      );
    while (remaining.length > 0) {
      const nextIndex = remaining.findIndex(
        (item) =>
          !item.dependsOnAttributeId || seen.has(item.dependsOnAttributeId)
      );
      const index = nextIndex === -1 ? 0 : nextIndex;
      const [next] = remaining.splice(index, 1);
      ordered.push(next);
      seen.add(next.id);
    }
  }
  return ordered;
}
