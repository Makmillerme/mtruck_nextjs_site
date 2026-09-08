import type { CatalogLayout } from "./catalog-layout";

export const CATALOG_SORTS = [
  "newest",
  "price-asc",
  "price-desc",
  "name",
] as const;

export type CatalogSort = (typeof CATALOG_SORTS)[number];

export type CatalogQuery = {
  layout: CatalogLayout;
  search: string;
  sort: CatalogSort;
  brands: string[];
  featuredOnly: boolean;
};

export function parseCatalogSort(value?: string | null): CatalogSort {
  return CATALOG_SORTS.includes(value as CatalogSort)
    ? (value as CatalogSort)
    : "newest";
}

export function parseCatalogBrands(
  value?: string | string[] | null
): string[] {
  const raw = Array.isArray(value) ? value.join(",") : value ?? "";
  return [...new Set(raw.split(",").map((item) => item.trim()).filter(Boolean))];
}

export function parseFeaturedOnly(value?: string | null): boolean {
  return value === "1" || value === "true";
}
