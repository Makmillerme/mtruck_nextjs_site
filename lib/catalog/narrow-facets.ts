import type {
  PublicFilterFacet,
  PublicFilterNode,
  PublicFilterOption,
} from "@/lib/catalog/public-filter";
import { findFilterNode, pruneDependentFacetValues } from "@/lib/catalog/public-filter";
import type { FilterAvailabilityIndex, FilterAvailabilityRow } from "@/lib/catalog/filter-availability";
import type {
  CatalogRange,
  CatalogScopedFacets,
  CatalogScopedRanges,
} from "@/utils/catalog-query";

export type NarrowFacetsResult = {
  facets: PublicFilterFacet[];
  scopedFacets: Record<string, string[]>;
  scopedRanges: Record<string, CatalogRange>;
  /** First independent SELECT key used for optional grouping headings. */
  groupAnchorKey: string | null;
};

function inFolder(row: FilterAvailabilityRow, folderSlug: string | null) {
  if (!folderSlug) return true;
  return row.pathSlugs.includes(folderSlug);
}

function matchesOtherFilters(
  row: FilterAvailabilityRow,
  facets: Record<string, string[]>,
  ranges: Record<string, CatalogRange>,
  omitKey?: string
) {
  for (const [key, values] of Object.entries(facets)) {
    if (key === omitKey || !values.length) continue;
    const value = row.specs[key];
    if (value == null) return false;
    if (!values.includes(String(value))) return false;
  }
  for (const [key, range] of Object.entries(ranges)) {
    if (key === omitKey) continue;
    if (range.min == null && range.max == null) continue;
    const value = row.specs[key];
    if (typeof value !== "number") return false;
    if (range.min != null && value < range.min) return false;
    if (range.max != null && value > range.max) return false;
  }
  return true;
}

function firstIndependentSelectKey(facets: PublicFilterFacet[]) {
  return (
    facets.find(
      (facet) =>
        (facet.type === "SELECT" || !facet.type) &&
        !facet.dependsOnKey &&
        facet.options.length > 0
    )?.key ?? null
  );
}

/**
 * Narrow leaf facets to values present on real products given the rest of the draft.
 * Also prunes impossible draft selections.
 */
export function narrowFacetsForFolder(
  folderSlug: string | null,
  leafFacets: PublicFilterFacet[],
  scopedFacets: Record<string, string[]>,
  scopedRanges: Record<string, CatalogRange>,
  index: FilterAvailabilityIndex
): NarrowFacetsResult {
  const groupAnchorKey = firstIndependentSelectKey(leafFacets);
  const folderRows = index.rows.filter((row) => inFolder(row, folderSlug));

  const nextFacets: PublicFilterFacet[] = leafFacets.map((facet) => {
    const pool = folderRows.filter((row) =>
      matchesOtherFilters(row, scopedFacets, scopedRanges, facet.key)
    );

    if (facet.type === "NUMBER" || facet.type === "YEAR") {
      let min: number | null = null;
      let max: number | null = null;
      for (const row of pool) {
        const value = row.specs[facet.key];
        if (typeof value !== "number") continue;
        min = min == null ? value : Math.min(min, value);
        max = max == null ? value : Math.max(max, value);
      }
      return {
        ...facet,
        minBound: min != null ? Math.floor(min) : facet.minBound ?? null,
        maxBound: max != null ? Math.ceil(max) : facet.maxBound ?? null,
      };
    }

    if (facet.type === "BOOLEAN") {
      const hasTrue = pool.some((row) => row.specs[facet.key] === true);
      const hasFalse = pool.some((row) => row.specs[facet.key] === false);
      const options: PublicFilterOption[] = [];
      if (hasTrue || hasFalse) {
        // Keep boolean as checkbox; empty options means hide if neither exists.
        return { ...facet, options: hasTrue || hasFalse ? facet.options : [] };
      }
      return { ...facet, options };
    }

    const allowed = new Set<string>();
    for (const row of pool) {
      const value = row.specs[facet.key];
      if (typeof value === "string") allowed.add(value);
    }
    // Sticky: keep current selection visible even if cross-facet narrowing
    // would hide it (so multi-select of container types with several makes works).
    for (const slug of scopedFacets[facet.key] ?? []) allowed.add(slug);

    return {
      ...facet,
      options: facet.options.filter((option) => allowed.has(option.slug)),
    };
  });

  // Sticky independent selections: do not drop make/type picks just because
  // another facet narrowed the pool. Only drop values absent from CMS schema;
  // dependsOnKey prune runs next.
  const cleanedFacets: Record<string, string[]> = {};
  for (const facet of leafFacets) {
    const selected = scopedFacets[facet.key] ?? [];
    if (!selected.length) continue;
    if (facet.type === "BOOLEAN") {
      cleanedFacets[facet.key] = selected;
      continue;
    }
    const cmsAllowed = new Set(facet.options.map((option) => option.slug));
    const filtered = selected.filter((slug) => cmsAllowed.has(slug));
    if (filtered.length) cleanedFacets[facet.key] = filtered;
  }

  const cleanedRanges: Record<string, CatalogRange> = {};
  for (const facet of nextFacets) {
    if (facet.type !== "NUMBER" && facet.type !== "YEAR") continue;
    const range = scopedRanges[facet.key];
    if (!range || (range.min == null && range.max == null)) continue;
    const minBound = facet.minBound;
    const maxBound = facet.maxBound;
    let min = range.min;
    let max = range.max;
    if (min != null && minBound != null && min < minBound) min = minBound;
    if (max != null && maxBound != null && max > maxBound) max = maxBound;
    if (min != null && max != null && min > max) {
      min = minBound ?? min;
      max = maxBound ?? max;
    }
    cleanedRanges[facet.key] = { min: min ?? undefined, max: max ?? undefined };
  }

  const pruned = pruneDependentFacetValues(nextFacets, cleanedFacets);

  return {
    facets: nextFacets,
    scopedFacets: pruned,
    scopedRanges: cleanedRanges,
    groupAnchorKey,
  };
}


export function narrowDraftAgainstIndex(
  tree: PublicFilterNode[],
  folders: string[],
  scopedFacets: CatalogScopedFacets,
  scopedRanges: CatalogScopedRanges,
  index: FilterAvailabilityIndex
): {
  scopedFacets: CatalogScopedFacets;
  scopedRanges: CatalogScopedRanges;
  leafFacetsBySlug: Record<string, PublicFilterFacet[]>;
  groupAnchorBySlug: Record<string, string | null>;
} {
  const leafFacetsBySlug: Record<string, PublicFilterFacet[]> = {};
  const groupAnchorBySlug: Record<string, string | null> = {};
  const nextFacets: CatalogScopedFacets = {};
  const nextRanges: CatalogScopedRanges = {};

  const folder = folders[0] ?? null;
  if (!folder) {
    return {
      scopedFacets: {},
      scopedRanges: {},
      leafFacetsBySlug,
      groupAnchorBySlug,
    };
  }

  const node = findFilterNode(tree, folder);
  // Facets live on leaves only — parents keep draft as-is.
  if (!node || node.children.length > 0) {
    return {
      scopedFacets,
      scopedRanges,
      leafFacetsBySlug,
      groupAnchorBySlug,
    };
  }

  const result = narrowFacetsForFolder(
    folder,
    node.facets,
    scopedFacets[folder] ?? {},
    scopedRanges[folder] ?? {},
    index
  );

  leafFacetsBySlug[folder] = result.facets;
  groupAnchorBySlug[folder] = result.groupAnchorKey;
  if (Object.keys(result.scopedFacets).length) {
    nextFacets[folder] = result.scopedFacets;
  }
  if (Object.keys(result.scopedRanges).length) {
    nextRanges[folder] = result.scopedRanges;
  }

  return {
    scopedFacets: nextFacets,
    scopedRanges: nextRanges,
    leafFacetsBySlug,
    groupAnchorBySlug,
  };
}
