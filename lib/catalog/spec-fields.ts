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
