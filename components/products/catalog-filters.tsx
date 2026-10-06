"use client";

import { Button } from "@/components/ui/button";
import {
  CatalogFilterTree,
  FILTER_SCROLL_CLASS,
  type FilterTreeLabels,
} from "@/components/products/catalog-filter-tree";
import type { FilterAvailabilityIndex } from "@/lib/catalog/filter-availability";
import {
  findFilterNode,
  pruneDependentFacetValues,
  type PublicFilterNode,
  type PublicFilterSchema,
} from "@/lib/catalog/public-filter";
import { narrowDraftAgainstIndex } from "@/lib/catalog/narrow-facets";
import { sheetScrollBodyClassName } from "@/lib/ui/sheet-field";
import { cn } from "@/lib/utils";
import { useCatalogSoftNavOptional } from "@/components/products/catalog-soft-nav";
import { useRouter } from "@/i18n/navigation";
import {
  buildCatalogHref,
  buildCatalogHrefFromDraft,
  countActiveCatalogFilters,
  parseCatalogQuery,
  serializeCatalogFilterDraft,
  type CatalogRange,
  type CatalogScopedFacets,
  type CatalogScopedRanges,
} from "@/utils/catalog-query";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { LuTrash2 } from "react-icons/lu";

type FilterDraft = {
  folders: string[];
  scopedFacets: CatalogScopedFacets;
  scopedRanges: CatalogScopedRanges;
};

export type CatalogFilterDraft = FilterDraft;

export const EMPTY_CATALOG_FILTER_DRAFT: CatalogFilterDraft = {
  folders: [],
  scopedFacets: {},
  scopedRanges: {},
};

type CatalogFilterApi = {
  t: ReturnType<typeof useTranslations>;
  schema: PublicFilterSchema;
  displayTree: PublicFilterNode[];
  availability: FilterAvailabilityIndex;
  query: unknown;
  draft: FilterDraft;
  activeCount: number;
  draftActiveCount: number;
  isDirty: boolean;
  canClear: boolean;
  isPending: boolean;
  selectFolder: (slug: string) => void;
  toggleFacet: (
    folderSlug: string,
    key: string,
    value: string,
    checked: boolean
  ) => void;
  setRange: (folderSlug: string, key: string, range: CatalogRange) => void;
  applyFilters: () => void;
  clearFilters: () => void;
};

const CatalogFilterContext = createContext<CatalogFilterApi | null>(null);

function draftFromQuery(query: ReturnType<typeof parseCatalogQuery>): FilterDraft {
  return {
    folders: query.folders,
    scopedFacets: query.scopedFacets,
    scopedRanges: query.scopedRanges,
  };
}

function applyFacetOverrides(
  nodes: PublicFilterNode[],
  overrides: Record<string, PublicFilterNode["facets"]>
): PublicFilterNode[] {
  return nodes.map((node) => {
    const children = applyFacetOverrides(node.children, overrides);
    const facets = overrides[node.slug] ?? node.facets;
    return { ...node, children, facets };
  });
}

export function useCatalogFilters(
  schema: PublicFilterSchema,
  availability: FilterAvailabilityIndex,
  onApplied?: () => void
) {
  const t = useTranslations("Products");
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = parseCatalogQuery(searchParams);
  const applied = draftFromQuery(query);
  const urlKey = searchParams.toString();

  const [draft, setDraft] = useState<FilterDraft>(applied);
  const [prevUrlKey, setPrevUrlKey] = useState(urlKey);

  if (urlKey !== prevUrlKey) {
    setPrevUrlKey(urlKey);
    setDraft(draftFromQuery(query));
  }

  const narrowed = useMemo(
    () =>
      narrowDraftAgainstIndex(
        schema.tree,
        draft.folders,
        draft.scopedFacets,
        draft.scopedRanges,
        availability
      ),
    [schema.tree, draft.folders, draft.scopedFacets, draft.scopedRanges, availability]
  );

  const narrowedKey = serializeCatalogFilterDraft({
    folders: draft.folders,
    scopedFacets: narrowed.scopedFacets,
    scopedRanges: narrowed.scopedRanges,
  });
  const draftKey = serializeCatalogFilterDraft(draft);
  if (narrowedKey !== draftKey && draft.folders.length > 0) {
    setDraft({
      folders: draft.folders,
      scopedFacets: narrowed.scopedFacets,
      scopedRanges: narrowed.scopedRanges,
    });
  }

  const displayTree = useMemo(
    () => applyFacetOverrides(schema.tree, narrowed.leafFacetsBySlug),
    [schema.tree, narrowed.leafFacetsBySlug]
  );

  const activeCount = countActiveCatalogFilters(query);
  const draftActiveCount = countActiveCatalogFilters({
    folders: draft.folders,
    scopedFacets: draft.scopedFacets,
    scopedRanges: draft.scopedRanges,
    facets: {},
    ranges: {},
  });
  const isDirty =
    serializeCatalogFilterDraft(draft) !==
    serializeCatalogFilterDraft(applied);
  const canClear = draftActiveCount > 0 || activeCount > 0;

  const softNav = useCatalogSoftNavOptional();
  const [localPending, startLocalTransition] = useTransition();
  const startTransition = softNav?.startTransition ?? startLocalTransition;
  const isPending = softNav?.isPending ?? localPending;

  function go(href: string) {
    startTransition(() => {
      router.replace(href, { scroll: false });
    });
  }

  function current() {
    return new URLSearchParams(window.location.search);
  }

  function selectFolder(slug: string) {
    if (!slug) {
      setDraft(EMPTY_CATALOG_FILTER_DRAFT);
      return;
    }
    setDraft((currentDraft) => ({
      folders: [slug],
      scopedFacets: currentDraft.scopedFacets[slug]
        ? { [slug]: currentDraft.scopedFacets[slug] }
        : {},
      scopedRanges: currentDraft.scopedRanges[slug]
        ? { [slug]: currentDraft.scopedRanges[slug] }
        : {},
    }));
  }

  function toggleFacet(
    folderSlug: string,
    key: string,
    value: string,
    checked: boolean
  ) {
    setDraft((currentDraft) => {
      const bucket = currentDraft.scopedFacets[folderSlug] ?? {};
      const list = bucket[key] ?? [];
      const nextValues = checked
        ? [...list, value]
        : list.filter((item) => item !== value);
      const node = findFilterNode(schema.tree, folderSlug);
      const nextBucket = pruneDependentFacetValues(node?.facets ?? [], {
        ...bucket,
        [key]: nextValues,
      });
      return {
        folders: [folderSlug],
        scopedFacets: { [folderSlug]: nextBucket },
        scopedRanges: currentDraft.scopedRanges[folderSlug]
          ? { [folderSlug]: currentDraft.scopedRanges[folderSlug] }
          : {},
      };
    });
  }

  function setRange(folderSlug: string, key: string, range: CatalogRange) {
    setDraft((currentDraft) => ({
      folders: [folderSlug],
      scopedFacets: currentDraft.scopedFacets[folderSlug]
        ? { [folderSlug]: currentDraft.scopedFacets[folderSlug] }
        : currentDraft.scopedFacets,
      scopedRanges: {
        [folderSlug]: {
          ...(currentDraft.scopedRanges[folderSlug] ?? {}),
          [key]: range,
        },
      },
    }));
  }

  function applyFilters() {
    if (!isDirty) return;
    go(buildCatalogHrefFromDraft(current(), draft));
    onApplied?.();
  }

  function clearFilters() {
    setDraft({ folders: [], scopedFacets: {}, scopedRanges: {} });
    if (activeCount > 0) {
      go(buildCatalogHref(current(), { clearFacets: true }));
    }
  }

  return {
    t,
    schema,
    displayTree,
    availability,
    query,
    draft,
    activeCount,
    draftActiveCount,
    isDirty,
    canClear,
    isPending,
    selectFolder,
    toggleFacet,
    setRange,
    applyFilters,
    clearFilters,
  };
}

export function CatalogFilterProvider({
  schema,
  availability,
  onApplied,
  children,
}: {
  schema: PublicFilterSchema;
  availability: FilterAvailabilityIndex;
  onApplied?: () => void;
  children: ReactNode;
}) {
  const api = useCatalogFilters(schema, availability, onApplied);
  return (
    <CatalogFilterContext.Provider value={api}>
      {children}
    </CatalogFilterContext.Provider>
  );
}

/**
 * Catalog filter UI without URL sync — admin sheet / embedded surfaces.
 * Parent owns `applied`; draft is local until Apply.
 */
export function useLocalCatalogFilters(
  schema: PublicFilterSchema,
  availability: FilterAvailabilityIndex,
  applied: CatalogFilterDraft,
  onAppliedChange: (draft: CatalogFilterDraft) => void,
  onSheetApplied?: () => void
) {
  const t = useTranslations("Products");
  const appliedKey = serializeCatalogFilterDraft(applied);
  const [draft, setDraft] = useState<CatalogFilterDraft>(applied);
  const [prevAppliedKey, setPrevAppliedKey] = useState(appliedKey);

  if (appliedKey !== prevAppliedKey) {
    setPrevAppliedKey(appliedKey);
    setDraft(applied);
  }

  const narrowed = useMemo(
    () =>
      narrowDraftAgainstIndex(
        schema.tree,
        draft.folders,
        draft.scopedFacets,
        draft.scopedRanges,
        availability
      ),
    [
      schema.tree,
      draft.folders,
      draft.scopedFacets,
      draft.scopedRanges,
      availability,
    ]
  );

  const narrowedKey = serializeCatalogFilterDraft({
    folders: draft.folders,
    scopedFacets: narrowed.scopedFacets,
    scopedRanges: narrowed.scopedRanges,
  });
  const draftKey = serializeCatalogFilterDraft(draft);
  if (narrowedKey !== draftKey && draft.folders.length > 0) {
    setDraft({
      folders: draft.folders,
      scopedFacets: narrowed.scopedFacets,
      scopedRanges: narrowed.scopedRanges,
    });
  }

  const displayTree = useMemo(
    () => applyFacetOverrides(schema.tree, narrowed.leafFacetsBySlug),
    [schema.tree, narrowed.leafFacetsBySlug]
  );

  const activeCount = countActiveCatalogFilters({
    folders: applied.folders,
    scopedFacets: applied.scopedFacets,
    scopedRanges: applied.scopedRanges,
    facets: {},
    ranges: {},
  });
  const draftActiveCount = countActiveCatalogFilters({
    folders: draft.folders,
    scopedFacets: draft.scopedFacets,
    scopedRanges: draft.scopedRanges,
    facets: {},
    ranges: {},
  });
  const isDirty =
    serializeCatalogFilterDraft(draft) !==
    serializeCatalogFilterDraft(applied);
  const canClear = draftActiveCount > 0 || activeCount > 0;

  function selectFolder(slug: string) {
    if (!slug) {
      setDraft(EMPTY_CATALOG_FILTER_DRAFT);
      return;
    }
    setDraft((currentDraft) => ({
      folders: [slug],
      scopedFacets: currentDraft.scopedFacets[slug]
        ? { [slug]: currentDraft.scopedFacets[slug] }
        : {},
      scopedRanges: currentDraft.scopedRanges[slug]
        ? { [slug]: currentDraft.scopedRanges[slug] }
        : {},
    }));
  }

  function toggleFacet(
    folderSlug: string,
    key: string,
    value: string,
    checked: boolean
  ) {
    setDraft((currentDraft) => {
      const bucket = currentDraft.scopedFacets[folderSlug] ?? {};
      const list = bucket[key] ?? [];
      const nextValues = checked
        ? [...list, value]
        : list.filter((item) => item !== value);
      const node = findFilterNode(schema.tree, folderSlug);
      const nextBucket = pruneDependentFacetValues(node?.facets ?? [], {
        ...bucket,
        [key]: nextValues,
      });
      return {
        folders: [folderSlug],
        scopedFacets: { [folderSlug]: nextBucket },
        scopedRanges: currentDraft.scopedRanges[folderSlug]
          ? { [folderSlug]: currentDraft.scopedRanges[folderSlug] }
          : {},
      };
    });
  }

  function setRange(folderSlug: string, key: string, range: CatalogRange) {
    setDraft((currentDraft) => ({
      folders: [folderSlug],
      scopedFacets: currentDraft.scopedFacets[folderSlug]
        ? { [folderSlug]: currentDraft.scopedFacets[folderSlug] }
        : currentDraft.scopedFacets,
      scopedRanges: {
        [folderSlug]: {
          ...(currentDraft.scopedRanges[folderSlug] ?? {}),
          [key]: range,
        },
      },
    }));
  }

  function applyFilters() {
    if (!isDirty) return;
    onAppliedChange(draft);
    onSheetApplied?.();
  }

  function clearFilters() {
    setDraft(EMPTY_CATALOG_FILTER_DRAFT);
    onAppliedChange(EMPTY_CATALOG_FILTER_DRAFT);
  }

  return {
    t,
    schema,
    displayTree,
    availability,
    query: applied,
    draft,
    activeCount,
    draftActiveCount,
    isDirty,
    canClear,
    isPending: false,
    selectFolder,
    toggleFacet,
    setRange,
    applyFilters,
    clearFilters,
  };
}

export function LocalCatalogFilterProvider({
  schema,
  availability,
  applied,
  onAppliedChange,
  onSheetApplied,
  children,
}: {
  schema: PublicFilterSchema;
  availability: FilterAvailabilityIndex;
  applied: CatalogFilterDraft;
  onAppliedChange: (draft: CatalogFilterDraft) => void;
  onSheetApplied?: () => void;
  children: ReactNode;
}) {
  const api = useLocalCatalogFilters(
    schema,
    availability,
    applied,
    onAppliedChange,
    onSheetApplied
  );
  return (
    <CatalogFilterContext.Provider value={api}>
      {children}
    </CatalogFilterContext.Provider>
  );
}

function useCatalogFilterContext() {
  const ctx = useContext(CatalogFilterContext);
  if (!ctx) {
    throw new Error("CatalogFilter* must be used inside CatalogFilterProvider");
  }
  return ctx;
}

/** UI Lab: LuTrash2 — clear filters (не LuX: плутають із закриттям). */
export function CatalogFilterClearButton({
  className,
}: {
  className?: string;
}) {
  const { t, canClear, isPending, clearFilters } = useCatalogFilterContext();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn("size-8 shrink-0", className)}
      disabled={!canClear || isPending}
      aria-label={t("filterClear")}
      title={t("filterClear")}
      onClick={clearFilters}
    >
      <LuTrash2 className="size-4" />
    </Button>
  );
}

export function CatalogFilterFields({
  idPrefix,
  className,
  clearBelowApply = false,
}: {
  idPrefix: string;
  className?: string;
  /** Mobile sheet: full-width clear under apply (desktop keeps header trash). */
  clearBelowApply?: boolean;
}) {
  const {
    t,
    displayTree,
    draft,
    isDirty,
    isPending,
    canClear,
    selectFolder,
    toggleFacet,
    setRange,
    applyFilters,
    clearFilters,
  } = useCatalogFilterContext();

  const empty = displayTree.length === 0;
  const labels: FilterTreeLabels = {
    from: t("filterFrom"),
    to: t("filterTo"),
    empty: t("filterEmpty"),
    expand: t("filterExpand"),
    collapse: t("filterCollapse"),
  };

  return (
    <div className={cn("flex h-full min-h-0 flex-1 flex-col gap-6", className)}>
      <div
        className={cn(
          sheetScrollBodyClassName,
          "pb-2 pr-3",
          FILTER_SCROLL_CLASS
        )}
      >
        {empty ? (
          <p className="text-sm text-muted-foreground">
            {t("filterEmptyFacets")}
          </p>
        ) : (
          <CatalogFilterTree
            nodes={displayTree}
            selected={draft.folders}
            initialOpenSlug={draft.folders.at(-1) ?? null}
            scopedFacets={draft.scopedFacets}
            scopedRanges={draft.scopedRanges}
            labels={labels}
            idPrefix={idPrefix}
            onSelectFolder={selectFolder}
            onToggleFacet={toggleFacet}
            onSetRange={setRange}
          />
        )}
      </div>

      <div className="mt-auto shrink-0 space-y-2 p-px">
        <Button
          type="button"
          variant={isDirty ? "default" : "outline"}
          className="h-11 w-full"
          disabled={!isDirty || isPending}
          onClick={applyFilters}
        >
          {t("filterApply")}
        </Button>
        {clearBelowApply ? (
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full"
            disabled={!canClear || isPending}
            onClick={clearFilters}
          >
            {t("filterClear")}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
