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

export type CatalogScopedFacets = Record<string, Record<string, string[]>>;
export type CatalogScopedRanges = Record<string, Record<string, CatalogRange>>;

export type CatalogQuery = {
  layout: CatalogLayout;
  search: string;
  sort: CatalogSort;
  featuredOnly: boolean;
  folders: string[];
  /** Per-folder fields: f.{slug}.{key} */
  scopedFacets: CatalogScopedFacets;
  scopedRanges: CatalogScopedRanges;
  /** Legacy finder params without a folder prefix (f.make, yearFrom). */
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

function firstParam(value?: string | string[] | undefined): string {
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

function scopedPrefix(slug: string) {
  return `${FACET_PREFIX}${slug}.`;
}

function ensureRecord<T>(map: Record<string, T>, key: string, fallback: T): T {
  if (!map[key]) map[key] = fallback;
  return map[key]!;
}

function applyFacetRest(
  rest: string,
  value: string,
  facets: Record<string, string[]>,
  ranges: Record<string, CatalogRange>
) {
  if (rest.endsWith("Min")) {
    setRange(ranges, rest.slice(0, -3), "min", value);
  } else if (rest.endsWith("Max")) {
    setRange(ranges, rest.slice(0, -3), "max", value);
  } else {
    facets[rest] = parseCsvParam(value);
  }
}

export function deleteScopedFolderParams(params: URLSearchParams, slug: string) {
  const prefix = scopedPrefix(slug);
  for (const key of [...params.keys()]) {
    if (key.startsWith(prefix)) params.delete(key);
  }
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
  const scopedFacets: CatalogScopedFacets = {};
  const scopedRanges: CatalogScopedRanges = {};

  for (const [key, value] of entries) {
    if (!key.startsWith(FACET_PREFIX) || !value) continue;
    const rest = key.slice(FACET_PREFIX.length);
    const dot = rest.indexOf(".");
    if (dot === -1) {
      applyFacetRest(rest, value, facets, ranges);
      continue;
    }
    const slug = rest.slice(0, dot);
    const attr = rest.slice(dot + 1);
    if (!slug || !attr) continue;
    if (attr.endsWith("Min") || attr.endsWith("Max")) {
      const bucket: Record<string, CatalogRange> =
        scopedRanges[slug] ?? (scopedRanges[slug] = {});
      const side = attr.endsWith("Min") ? "min" : "max";
      const rangeKey = attr.slice(0, -3);
      setRange(bucket, rangeKey, side, value);
    } else {
      const bucket: Record<string, string[]> =
        scopedFacets[slug] ?? (scopedFacets[slug] = {});
      bucket[attr] = parseCsvParam(value);
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
  const folders = parseCsvParam(get("folder") || get("category"));

  return {
    layout: layoutRaw ? parseCatalogLayout(layoutRaw) : undefined,
    search: get("search")?.trim() ?? "",
    sort: parseCatalogSort(get("sort")),
    featuredOnly: parseFeaturedOnly(get("featured")),
    folders,
    scopedFacets,
    scopedRanges,
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
  /** Add or remove a folder without wiping others. Removing also drops f.{slug}.* */
  toggleFolder?: string;
  /** Replace folder list with one leaf; drop other folders’ scoped params. */
  setFolder?: string;
  facetFolder?: string;
  facetKey?: string;
  facetValues?: string[];
  /** Replace all non-range scoped facet params for facetFolder. */
  scopedFacetBucket?: Record<string, string[]>;
  rangeFolder?: string;
  rangeKey?: string;
  range?: CatalogRange;
  clearFacets?: boolean;
  page?: number;
  pageSize?: CatalogPageSize;
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

function writeFolderList(params: URLSearchParams, folders: string[]) {
  const unique = [...new Set(folders.filter(Boolean))];
  if (unique.length) params.set("folder", unique.join(","));
  else {
    params.delete("folder");
    params.delete("category");
  }
}

function currentFolders(params: URLSearchParams): string[] {
  return parseCsvParam(params.get("folder") || params.get("category"));
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
    writeFolderList(params, patch.folders);
  }

  if (patch.toggleFolder) {
    const slug = patch.toggleFolder;
    const next = currentFolders(params);
    const index = next.indexOf(slug);
    if (index >= 0) {
      next.splice(index, 1);
      deleteScopedFolderParams(params, slug);
    } else {
      next.push(slug);
    }
    writeFolderList(params, next);
  }

  if (patch.setFolder) {
    const keep = patch.setFolder;
    for (const slug of currentFolders(params)) {
      if (slug !== keep) deleteScopedFolderParams(params, slug);
    }
    writeFolderList(params, [keep]);
  }

  if (patch.facetKey) {
    const folder = patch.facetFolder;
    const key = folder
      ? `${FACET_PREFIX}${folder}.${patch.facetKey}`
      : `${FACET_PREFIX}${patch.facetKey}`;
    const values = patch.facetValues ?? [];
    if (values.length) params.set(key, values.join(","));
    else params.delete(key);
    if (folder) {
      const next = currentFolders(params);
      if (!next.includes(folder)) {
        next.push(folder);
        writeFolderList(params, next);
      }
    }
    if (patch.facetKey === "make" && !folder) {
      params.delete("make");
      params.delete("brand");
    }
  }

  if (patch.scopedFacetBucket && patch.facetFolder) {
    const folder = patch.facetFolder;
    const prefix = scopedPrefix(folder);
    const bucket = patch.scopedFacetBucket;
    for (const key of [...params.keys()]) {
      if (!key.startsWith(prefix)) continue;
      const rest = key.slice(prefix.length);
      if (rest.endsWith("Min") || rest.endsWith("Max")) continue;
      const values = bucket[rest] ?? [];
      if (!values.length) params.delete(key);
    }
    for (const [facetKey, values] of Object.entries(bucket)) {
      const key = `${prefix}${facetKey}`;
      if (values.length) params.set(key, values.join(","));
      else params.delete(key);
    }
    const next = currentFolders(params);
    if (!next.includes(folder)) {
      next.push(folder);
      writeFolderList(params, next);
    }
  }

  if (patch.rangeKey) {
    const folder = patch.rangeFolder;
    const prefix = folder
      ? `${FACET_PREFIX}${folder}.${patch.rangeKey}`
      : `${FACET_PREFIX}${patch.rangeKey}`;
    const minKey = `${prefix}Min`;
    const maxKey = `${prefix}Max`;
    const min = patch.range?.min;
    const max = patch.range?.max;
    if (min != null) params.set(minKey, String(min));
    else params.delete(minKey);
    if (max != null) params.set(maxKey, String(max));
    else params.delete(maxKey);
    if (folder) {
      const next = currentFolders(params);
      if (!next.includes(folder)) {
        next.push(folder);
        writeFolderList(params, next);
      }
    }
    if (!folder && patch.rangeKey === "year") {
      params.delete("yearFrom");
      params.delete("yearTo");
    }
    if (!folder && patch.rangeKey === "mileage") {
      params.delete("kmFrom");
      params.delete("kmTo");
    }
  }

  const shouldResetPage =
    patch.resetPage === true ||
    (patch.resetPage !== false &&
      (patch.clearFacets ||
        patch.folders !== undefined ||
        patch.toggleFolder !== undefined ||
        patch.setFolder !== undefined ||
        patch.facetKey !== undefined ||
        patch.scopedFacetBucket !== undefined ||
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

/** One-shot apply of local filter draft (folders + scoped facets/ranges). */
export function buildCatalogHrefFromDraft(
  current: URLSearchParams,
  draft: {
    folders: string[];
    scopedFacets: CatalogScopedFacets;
    scopedRanges: CatalogScopedRanges;
  }
): string {
  let href = buildCatalogHref(current, { clearFacets: true, resetPage: true });
  const paramsOf = (path: string) =>
    new URLSearchParams(path.includes("?") ? path.split("?")[1] : "");

  const folder = draft.folders[0];
  if (folder) {
    href = buildCatalogHref(paramsOf(href), {
      setFolder: folder,
      resetPage: true,
    });
    const bucket = draft.scopedFacets[folder] ?? {};
    if (Object.keys(bucket).length) {
      href = buildCatalogHref(paramsOf(href), {
        facetFolder: folder,
        scopedFacetBucket: bucket,
        resetPage: true,
      });
    }
    const ranges = draft.scopedRanges[folder] ?? {};
    for (const [rangeKey, range] of Object.entries(ranges)) {
      if (range.min == null && range.max == null) continue;
      href = buildCatalogHref(paramsOf(href), {
        rangeFolder: folder,
        rangeKey,
        range,
        resetPage: true,
      });
    }
  }

  return href;
}

export function serializeCatalogFilterDraft(draft: {
  folders: string[];
  scopedFacets: CatalogScopedFacets;
  scopedRanges: CatalogScopedRanges;
}): string {
  const facets: CatalogScopedFacets = {};
  for (const slug of Object.keys(draft.scopedFacets).sort()) {
    const bucket = draft.scopedFacets[slug] ?? {};
    const next: Record<string, string[]> = {};
    for (const key of Object.keys(bucket).sort()) {
      const values = [...(bucket[key] ?? [])].sort();
      if (values.length) next[key] = values;
    }
    if (Object.keys(next).length) facets[slug] = next;
  }
  const ranges: CatalogScopedRanges = {};
  for (const slug of Object.keys(draft.scopedRanges).sort()) {
    const bucket = draft.scopedRanges[slug] ?? {};
    const next: Record<string, CatalogRange> = {};
    for (const key of Object.keys(bucket).sort()) {
      const range = bucket[key] ?? {};
      if (range.min == null && range.max == null) continue;
      next[key] = { min: range.min, max: range.max };
    }
    if (Object.keys(next).length) ranges[slug] = next;
  }
  return JSON.stringify({
    folders: [...draft.folders].sort(),
    scopedFacets: facets,
    scopedRanges: ranges,
  });
}

export function countActiveCatalogFilters(query: {
  folders: string[];
  scopedFacets?: CatalogScopedFacets;
  scopedRanges?: CatalogScopedRanges;
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
  for (const bucket of Object.values(query.scopedFacets ?? {})) {
    for (const values of Object.values(bucket)) count += values.length;
  }
  for (const bucket of Object.values(query.scopedRanges ?? {})) {
    for (const range of Object.values(bucket)) {
      if (range.min != null) count += 1;
      if (range.max != null) count += 1;
    }
  }
  return count;
}

export function catalogQueryIsFiltered(query: {
  search: string;
  folders: string[];
  featuredOnly: boolean;
  facets: Record<string, string[]>;
  ranges: Record<string, CatalogRange>;
  scopedFacets?: CatalogScopedFacets;
  scopedRanges?: CatalogScopedRanges;
}): boolean {
  return Boolean(
    query.search ||
      query.folders.length ||
      query.featuredOnly ||
      Object.keys(query.facets).length ||
      Object.keys(query.ranges).length ||
      Object.keys(query.scopedFacets ?? {}).length ||
      Object.keys(query.scopedRanges ?? {}).length
  );
}
