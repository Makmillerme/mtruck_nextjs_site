export const CATALOG_LAYOUT_COOKIE = "mtruck-catalog-layout";

export type CatalogLayout = "grid" | "list";

export function parseCatalogLayout(value?: string | null): CatalogLayout {
  return value === "list" ? "list" : "grid";
}
