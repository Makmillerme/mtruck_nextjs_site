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
import { cn } from "@/lib/utils";
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

type CatalogFilterApi = ReturnType<typeof useCatalogFilters>;

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
  availability: FilterAvailabilityIndex
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
    featuredOnly: false,
  });
  const isDirty =
    serializeCatalogFilterDraft(draft) !==
    serializeCatalogFilterDraft(applied);
  const canClear = draftActiveCount > 0 || activeCount > 0;

  const [isPending, startTransition] = useTransition();

  function go(href: string) {
    startTransition(() => {
      router.replace(href, { scroll: false });
    });
  }

  function current() {
    return new URLSearchParams(window.location.search);
  }

  function selectFolder(slug: string) {
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
  children,
}: {
  schema: PublicFilterSchema;
  availability: FilterAvailabilityIndex;
  children: ReactNode;
}) {
  const api = useCatalogFilters(schema, availability);
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
}: {
  idPrefix: string;
  className?: string;
}) {
  const {
    t,
    displayTree,
    draft,
    isDirty,
    isPending,
    selectFolder,
    toggleFacet,
    setRange,
    applyFilters,
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
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <div className={cn("min-h-0 flex-1 pr-3", FILTER_SCROLL_CLASS)}>
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

      <div className="shrink-0 pt-3">
        <Button
          type="button"
          variant={isDirty ? "default" : "outline"}
          className="h-10 w-full text-sm"
          disabled={!isDirty || isPending}
          onClick={applyFilters}
        >
          {t("filterApply")}
        </Button>
      </div>
    </div>
  );
}
