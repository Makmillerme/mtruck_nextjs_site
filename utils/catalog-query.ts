import { parseCatalogLayout, type CatalogLayout } from "./catalog-layout";

export const CATALOG_SORTS = [
  "newest",
  "price-asc",
  "price-desc",
  "name",
] as const;

export type CatalogSort = (typeof CATALOG_SORTS)[number];

export const CATALOG_PAGE_SIZES = [10, 25, 40] as const;
export type CatalogPageSize = (typeof CATALOG_PAGE_SIZES)[number];
export const DEFAULT_CATALOG_PAGE_SIZE: CatalogPageSize = 10;

export type CatalogRange = {
  min?: number;
  max?: number;
};

export type CatalogQuery = {
  layout: CatalogLayout;
  search: string;
  sort: CatalogSort;
  featuredOnly: boolean;
  folders: string[];
  facets: Record<string, string[]>;
  ranges: Record<string, CatalogRange>;
  page: number;
  pageSize: CatalogPageSize;
};

const FACET_PREFIX = "f.";

export function parseCatalogSort(value?: string | null): CatalogSort {
  return CATALOG_SORTS.includes(value as CatalogSort)
    ? (value as CatalogSort)
    : "newest";
}

export function parseCatalogPageSize(value?: string | null): CatalogPageSize {
  const n = Number(value);
  return CATALOG_PAGE_SIZES.includes(n as CatalogPageSize)
    ? (n as CatalogPageSize)
    : DEFAULT_CATALOG_PAGE_SIZE;
}

export function parseCatalogPage(value?: string | null): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

export function parseCsvParam(value?: string | string[] | null): string[] {
  const raw = Array.isArray(value) ? value.join(",") : value ?? "";
  return [...new Set(raw.split(",").map((item) => item.trim()).filter(Boolean))];
}

export function parseFeaturedOnly(value?: string | null): boolean {
  return value === "1" || value === "true";
}

function firstParam(value?: string | string[] | null): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function parseNumber(value?: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function setRange(
  ranges: Record<string, CatalogRange>,
  key: string,
  side: "min" | "max",
  value: string
) {
  const next = ranges[key] ?? {};
  next[side] = parseNumber(value);
  ranges[key] = next;
}

/** Read catalog URL. Legacy `brand`/`make`/`category`/`yearFrom`/`kmFrom` still map in. */
export function parseCatalogQuery(
  params: URLSearchParams | Record<string, string | string[] | undefined>
): Omit<CatalogQuery, "layout"> & { layout?: CatalogLayout } {
  const get = (key: string) => {
    if (params instanceof URLSearchParams) return params.get(key);
    return firstParam(params[key]);
  };
  const entries: [string, string][] =
    params instanceof URLSearchParams
      ? [...params.entries()]
      : Object.entries(params).flatMap(([key, value]) =>
          value == null
            ? []
            : Array.isArray(value)
              ? value.map((item) => [key, item] as [string, string])
              : [[key, value] as [string, string]]
        );

  const facets: Record<string, string[]> = {};
  const ranges: Record<string, CatalogRange> = {};

  for (const [key, value] of entries) {
    if (!key.startsWith(FACET_PREFIX) || !value) continue;
    const rest = key.slice(FACET_PREFIX.length);
    if (rest.endsWith("Min")) {
      setRange(ranges, rest.slice(0, -3), "min", value);
    } else if (rest.endsWith("Max")) {
      setRange(ranges, rest.slice(0, -3), "max", value);
    } else {
      facets[rest] = parseCsvParam(value);
    }
  }

  const legacyMake = parseCsvParam(get("make") || get("brand"));
  if (legacyMake.length && !facets.make?.length) {
    facets.make = legacyMake;
  }
  if (get("yearFrom") || get("yearTo")) {
    ranges.year = {
      min: parseNumber(get("yearFrom")),
      max: parseNumber(get("yearTo")),
    };
  }
  if (get("kmFrom") || get("kmTo")) {
    ranges.mileage = {
      min: parseNumber(get("kmFrom")),
      max: parseNumber(get("kmTo")),
    };
  }

  const layoutRaw = get("layout");
  const pageSize = parseCatalogPageSize(get("pageSize"));

  return {
    layout: layoutRaw ? parseCatalogLayout(layoutRaw) : undefined,
    search: get("search")?.trim() ?? "",
    sort: parseCatalogSort(get("sort")),
    featuredOnly: parseFeaturedOnly(get("featured")),
    folders: parseCsvParam(get("folder") || get("category")),
    facets,
    ranges,
    page: parseCatalogPage(get("page")),
    pageSize,
  };
}

export type CatalogHrefPatch = {
  layout?: CatalogLayout;
  search?: string;
  sort?: CatalogSort | "newest";
  featuredOnly?: boolean;
  folders?: string[];
  facetKey?: string;
  facetValues?: string[];
  rangeKey?: string;
  range?: CatalogRange;
  clearFacets?: boolean;
  page?: number;
  pageSize?: CatalogPageSize;
  /** Reset page to 1 when filters/sort/size change. Default true for filter patches. */
  resetPage?: boolean;
};

function clearFacetParams(params: URLSearchParams) {
  for (const key of [...params.keys()]) {
    if (
      key.startsWith(FACET_PREFIX) ||
      key === "folder" ||
      key === "category" ||
      key === "brand" ||
      key === "make" ||
      key === "featured" ||
      key === "yearFrom" ||
      key === "yearTo" ||
      key === "kmFrom" ||
      key === "kmTo"
    ) {
      params.delete(key);
    }
  }
}

export function buildCatalogHref(
  current: URLSearchParams,
  patch: CatalogHrefPatch = {}
): string {
  const params = new URLSearchParams(current.toString());

  if (patch.clearFacets) {
    clearFacetParams(params);
  }

  if (patch.layout) params.set("layout", patch.layout);

  if (patch.search !== undefined) {
    if (patch.search) params.set("search", patch.search);
    else params.delete("search");
  }

  if (patch.sort !== undefined) {
    if (patch.sort && patch.sort !== "newest") params.set("sort", patch.sort);
    else params.delete("sort");
  }

  if (patch.featuredOnly !== undefined) {
    if (patch.featuredOnly) params.set("featured", "1");
    else params.delete("featured");
  }

  if (patch.folders) {
    if (patch.folders.length) params.set("folder", patch.folders.join(","));
    else {
      params.delete("folder");
      params.delete("category");
    }
  }

  if (patch.facetKey) {
    const key = `${FACET_PREFIX}${patch.facetKey}`;
    const values = patch.facetValues ?? [];
    if (values.length) params.set(key, values.join(","));
    else params.delete(key);
    if (patch.facetKey === "make") {
      params.delete("make");
      params.delete("brand");
    }
  }

  if (patch.rangeKey) {
    const minKey = `${FACET_PREFIX}${patch.rangeKey}Min`;
    const maxKey = `${FACET_PREFIX}${patch.rangeKey}Max`;
    const min = patch.range?.min;
    const max = patch.range?.max;
    if (min != null) params.set(minKey, String(min));
    else params.delete(minKey);
    if (max != null) params.set(maxKey, String(max));
    else params.delete(maxKey);
    if (patch.rangeKey === "year") {
      params.delete("yearFrom");
      params.delete("yearTo");
    }
    if (patch.rangeKey === "mileage") {
      params.delete("kmFrom");
      params.delete("kmTo");
    }
  }

  const shouldResetPage =
    patch.resetPage === true ||
    (patch.resetPage !== false &&
      (patch.clearFacets ||
        patch.folders !== undefined ||
        patch.facetKey !== undefined ||
        patch.rangeKey !== undefined ||
        patch.search !== undefined ||
        patch.sort !== undefined ||
        patch.featuredOnly !== undefined ||
        patch.pageSize !== undefined));

  if (patch.pageSize !== undefined) {
    if (patch.pageSize === DEFAULT_CATALOG_PAGE_SIZE) params.delete("pageSize");
    else params.set("pageSize", String(patch.pageSize));
  }

  if (patch.page !== undefined) {
    if (patch.page <= 1) params.delete("page");
    else params.set("page", String(patch.page));
  } else if (shouldResetPage) {
    params.delete("page");
  }

  const query = params.toString();
  return query ? `/products?${query}` : "/products";
}

export function countActiveCatalogFilters(query: {
  folders: string[];
  facets: Record<string, string[]>;
  ranges: Record<string, CatalogRange>;
  featuredOnly: boolean;
}): number {
  let count = query.folders.length + (query.featuredOnly ? 1 : 0);
  for (const values of Object.values(query.facets)) count += values.length;
  for (const range of Object.values(query.ranges)) {
    if (range.min != null) count += 1;
    if (range.max != null) count += 1;
  }
  return count;
}
