import type { FilterAvailabilityIndex } from "@/lib/catalog/filter-availability";
import type { AttributeTypeName } from "@/lib/catalog/types";

export type HomeFinderFacetOption = {
  slug: string;
  label: string;
  parentSlug: string | null;
};

export type HomeFinderFacet = {
  key: string;
  name: string;
  type: Exclude<AttributeTypeName, "TEXT">;
  unit: string | null;
  dependsOnKey: string | null;
  options: HomeFinderFacetOption[];
  minBound: number | null;
  maxBound: number | null;
};

/** Homepage finder: catalog → type → subtype. Deeper CMS folders are omitted. */
export const HOME_FILTER_MAX_DEPTH = 3;

export type HomeFinderChild = {
  id: string;
  slug: string;
  name: string;
  productCount: number;
  facets: HomeFinderFacet[];
  /** Nested folders visible via showInHomeFilter, capped at HOME_FILTER_MAX_DEPTH. */
  children: HomeFinderChild[];
};

export type HomeFinderRoot = {
  id: string;
  slug: string;
  name: string;
  productCount: number;
  children: HomeFinderChild[];
};

export type HomeFinderPayload = {
  /** True when at least one home-visible root should render as catalog chips. */
  showRootsBlock: boolean;
  roots: HomeFinderRoot[];
  /** Same published-product index as the catalog filter (client narrowing). */
  availability: FilterAvailabilityIndex;
};

/** Build /products href from homepage finder selection. */
export function buildHomeFinderProductsHref(input: {
  folderSlug: string;
  facets: Record<string, string | null>;
  ranges: Record<string, { from?: number; to?: number }>;
}): string {
  const params = new URLSearchParams();
  params.set("folder", input.folderSlug);

  for (const [key, value] of Object.entries(input.facets)) {
    if (value) params.set(`f.${key}`, value);
  }

  for (const [key, range] of Object.entries(input.ranges)) {
    if (range.from != null) params.set(`f.${key}Min`, String(range.from));
    if (range.to != null) params.set(`f.${key}Max`, String(range.to));
  }

  const query = params.toString();
  return query ? `/products?${query}` : "/products";
}

export function resolveHomeFinderDefaults(
  payload: HomeFinderPayload
): {
  rootId: string | null;
  childId: string | null;
  grandchildId: string | null;
} {
  const { roots } = payload;
  if (roots.length === 0) {
    return { rootId: null, childId: null, grandchildId: null };
  }
  const root = roots[0];
  const child = root.children[0] ?? null;
  return {
    rootId: root.id,
    childId: child?.id ?? null,
    grandchildId: child?.children[0]?.id ?? null,
  };
}
