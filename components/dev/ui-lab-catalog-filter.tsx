"use client";

import {
  CatalogFilterTree,
  FILTER_SCROLL_CLASS,
} from "@/components/products/catalog-filter-tree";
import CatalogPagination from "@/components/products/catalog-pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FilterAvailabilityIndex } from "@/lib/catalog/filter-availability";
import { narrowDraftAgainstIndex } from "@/lib/catalog/narrow-facets";
import {
  findFilterNode,
  pruneDependentFacetValues,
  type PublicFilterNode,
} from "@/lib/catalog/public-filter";
import { cn } from "@/lib/utils";
import {
  serializeCatalogFilterDraft,
  type CatalogPageSize,
  type CatalogRange,
  type CatalogScopedFacets,
  type CatalogScopedRanges,
} from "@/utils/catalog-query";
import { useMemo, useState } from "react";
import { LuTrash2 } from "react-icons/lu";

const MAKE_OPTIONS = [
  { slug: "man", label: "MAN", parentSlug: null },
  { slug: "mercedes", label: "Mercedes", parentSlug: null },
];

const MODEL_OPTIONS = [
  { slug: "tgx", label: "TGX", parentSlug: "man" },
  { slug: "tgs", label: "TGS", parentSlug: "man" },
  { slug: "actros", label: "Actros", parentSlug: "mercedes" },
  { slug: "atego", label: "Atego", parentSlug: "mercedes" },
];

const CONTAINER_OPTIONS = [
  { slug: "20ft", label: "20 ft", parentSlug: null },
  { slug: "40ft", label: "40 ft", parentSlug: null },
  { slug: "45ft", label: "45 ft", parentSlug: null },
];

const GEARBOX_OPTIONS = [
  { slug: "manual", label: "МКПП", parentSlug: null },
  { slug: "auto", label: "АКПП", parentSlug: null },
];

function selectFacet(
  name: string,
  key: string,
  options: { slug: string; label: string; parentSlug: string | null }[],
  dependsOnKey: string | null = null
) {
  return {
    key,
    name,
    type: "SELECT" as const,
    unit: null,
    dependsOnKey,
    options,
    minBound: null,
    maxBound: null,
  };
}

const DEMO_TREE: PublicFilterNode[] = [
  {
    id: "trucks",
    slug: "trucks",
    name: "Вантажні авто",
    facets: [],
    children: [
      {
        id: "containers",
        slug: "containers",
        name: "Контейнеровози",
        children: [],
        facets: [
          selectFacet("Марка", "make", MAKE_OPTIONS),
          selectFacet("Модель", "model", MODEL_OPTIONS, "make"),
          selectFacet("Тип контейнера", "containerType", CONTAINER_OPTIONS),
          selectFacet("КПП", "gearbox", GEARBOX_OPTIONS),
          {
            key: "year",
            name: "Рік",
            type: "YEAR",
            unit: null,
            dependsOnKey: null,
            options: [],
            minBound: 2015,
            maxBound: 2024,
          },
        ],
      },
    ],
  },
];

/** Demo inventory: MAN has 20/40 + manual; Mercedes has 40/45 + auto/manual. */
const DEMO_AVAILABILITY: FilterAvailabilityIndex = {
  rows: [
    {
      pathSlugs: ["containers", "trucks"],
      specs: {
        make: "man",
        model: "tgx",
        containerType: "20ft",
        gearbox: "manual",
        year: 2018,
      },
    },
    {
      pathSlugs: ["containers", "trucks"],
      specs: {
        make: "man",
        model: "tgs",
        containerType: "40ft",
        gearbox: "manual",
        year: 2020,
      },
    },
    {
      pathSlugs: ["containers", "trucks"],
      specs: {
        make: "mercedes",
        model: "actros",
        containerType: "40ft",
        gearbox: "auto",
        year: 2021,
      },
    },
    {
      pathSlugs: ["containers", "trucks"],
      specs: {
        make: "mercedes",
        model: "atego",
        containerType: "45ft",
        gearbox: "manual",
        year: 2019,
      },
    },
  ],
};

const LAB_LABELS = {
  from: "Від",
  to: "До",
  empty: "Немає значень для цього поля.",
  expand: "Розкрити",
  collapse: "Згорнути",
};

type LabDraft = {
  folders: string[];
  scopedFacets: CatalogScopedFacets;
  scopedRanges: CatalogScopedRanges;
};

const INITIAL_APPLIED: LabDraft = {
  folders: ["containers"],
  scopedFacets: { containers: { make: ["man"] } },
  scopedRanges: {},
};

function applyFacetOverrides(
  nodes: PublicFilterNode[],
  overrides: Record<string, PublicFilterNode["facets"]>
): PublicFilterNode[] {
  return nodes.map((node) => ({
    ...node,
    children: applyFacetOverrides(node.children, overrides),
    facets: overrides[node.slug] ?? node.facets,
  }));
}

export function UiLabCatalogFilterDemo() {
  const [applied, setApplied] = useState<LabDraft>(INITIAL_APPLIED);
  const [draft, setDraft] = useState<LabDraft>(INITIAL_APPLIED);

  const narrowed = useMemo(
    () =>
      narrowDraftAgainstIndex(
        DEMO_TREE,
        draft.folders,
        draft.scopedFacets,
        draft.scopedRanges,
        DEMO_AVAILABILITY
      ),
    [draft.folders, draft.scopedFacets, draft.scopedRanges]
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
    () => applyFacetOverrides(DEMO_TREE, narrowed.leafFacetsBySlug),
    [narrowed.leafFacetsBySlug]
  );

  const isDirty =
    serializeCatalogFilterDraft(draft) !==
    serializeCatalogFilterDraft(applied);
  const canClear =
    draft.folders.length > 0 ||
    Object.keys(draft.scopedFacets).length > 0 ||
    Object.keys(draft.scopedRanges).length > 0 ||
    applied.folders.length > 0;

  function selectFolder(slug: string) {
    setDraft((current) => ({
      folders: [slug],
      scopedFacets: current.scopedFacets[slug]
        ? { [slug]: current.scopedFacets[slug] }
        : {},
      scopedRanges: current.scopedRanges[slug]
        ? { [slug]: current.scopedRanges[slug] }
        : {},
    }));
  }

  function toggleFacet(
    folderSlug: string,
    key: string,
    value: string,
    checked: boolean
  ) {
    setDraft((current) => {
      const bucket = current.scopedFacets[folderSlug] ?? {};
      const list = bucket[key] ?? [];
      const nextValues = checked
        ? [...list, value]
        : list.filter((item) => item !== value);
      const node = findFilterNode(DEMO_TREE, folderSlug);
      return {
        folders: [folderSlug],
        scopedFacets: {
          [folderSlug]: pruneDependentFacetValues(node?.facets ?? [], {
            ...bucket,
            [key]: nextValues,
          }),
        },
        scopedRanges: current.scopedRanges[folderSlug]
          ? { [folderSlug]: current.scopedRanges[folderSlug] }
          : {},
      };
    });
  }

  function setRange(folderSlug: string, key: string, range: CatalogRange) {
    setDraft((current) => ({
      folders: [folderSlug],
      scopedFacets: current.scopedFacets[folderSlug]
        ? { [folderSlug]: current.scopedFacets[folderSlug] }
        : current.scopedFacets,
      scopedRanges: {
        [folderSlug]: {
          ...(current.scopedRanges[folderSlug] ?? {}),
          [key]: range,
        },
      },
    }));
  }

  function clearAll() {
    const empty = {
      folders: [] as string[],
      scopedFacets: {} as CatalogScopedFacets,
      scopedRanges: {} as CatalogScopedRanges,
    };
    setDraft(empty);
    setApplied(empty);
  }

  return (
    <div className="grid max-w-[22rem] gap-3">
      <p className="text-sm text-muted-foreground">
        Живе звуження по демо-індексу MAN/Mercedes. Кілька марок + кілька
        типів контейнера — sticky multi-select; зняли марку — модель зникає.
      </p>
      <Card className="flex w-full min-w-[16rem] max-h-[28rem] max-w-[22rem] flex-col border-border/60 shadow-sm">
        <CardHeader className="flex shrink-0 flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base">Фільтр</CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            disabled={!canClear}
            aria-label="Скинути фільтри"
            title="Скинути фільтри"
            onClick={clearAll}
          >
            <LuTrash2 className="size-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col pt-0">
          <div className={cn("min-h-0 flex-1 pr-3", FILTER_SCROLL_CLASS)}>
            <CatalogFilterTree
              nodes={displayTree}
              selected={draft.folders}
              initialOpenSlug={draft.folders.at(-1) ?? "containers"}
              scopedFacets={draft.scopedFacets}
              scopedRanges={draft.scopedRanges}
              labels={LAB_LABELS}
              idPrefix="lab-filter"
              onSelectFolder={selectFolder}
              onToggleFacet={toggleFacet}
              onSetRange={setRange}
            />
          </div>
          <div className="shrink-0 pt-3">
            <Button
              type="button"
              variant={isDirty ? "default" : "outline"}
              className="h-10 w-full text-sm"
              disabled={!isDirty}
              onClick={() => setApplied(draft)}
            >
              Фільтрувати
            </Button>
          </div>
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground">
        Застосовано:{" "}
        <span className="font-medium text-foreground">
          {applied.folders.length ? applied.folders.join(", ") : "—"}
        </span>
        {isDirty ? " · є незастосовані зміни" : null}
      </p>
    </div>
  );
}

export function UiLabCatalogPaginationDemo() {
  const [page, setPage] = useState(2);
  const [pageSize, setPageSize] = useState<CatalogPageSize>(10);
  const pageCount = 7;

  return (
    <div className="grid max-w-xl gap-3">
      <p className="text-sm text-muted-foreground">
        Стрілки + <code className="text-xs">сторінка / усього</code> + outline
        DropdownMenu 10/25/40. Той самий блок на{" "}
        <code className="text-xs">/products</code>.
      </p>
      <CatalogPagination
        page={page}
        pageCount={pageCount}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />
    </div>
  );
}
