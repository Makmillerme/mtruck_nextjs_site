"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import SectionIntro from "@/components/section-intro";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";
import { narrowFacetsForFolder } from "@/lib/catalog/narrow-facets";
import { pruneDependentFacetValues } from "@/lib/catalog/public-filter";
import type { PublicFilterFacet } from "@/lib/catalog/public-filter";
import {
  buildHomeFinderProductsHref,
  resolveHomeFinderDefaults,
  type HomeFinderChild,
  type HomeFinderFacet,
  type HomeFinderFacetOption,
  type HomeFinderPayload,
  type HomeFinderRoot,
} from "@/lib/home/home-finder-shared";
import { cn } from "@/lib/utils";
import type { CatalogRange } from "@/utils/catalog-query";
import { LuChevronRight } from "react-icons/lu";

function sanitizeDigits(value: string) {
  return value.replace(/\D/g, "");
}

const chipClass = (active: boolean) =>
  cn(
    "shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors",
    active
      ? "border-primary bg-primary text-primary-foreground"
      : "border-border bg-secondary text-muted-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground"
  );

const chipRowClass =
  "flex flex-nowrap items-center justify-start gap-2 overflow-x-auto overflow-y-hidden py-0.5 [-ms-overflow-style:none] [scrollbar-width:none] md:flex-wrap md:overflow-hidden [&::-webkit-scrollbar]:hidden";

const fieldLabelClass =
  "mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground";

function parsePositiveInt(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) return undefined;
  return Math.round(parsed);
}

function RangeInputs({
  label,
  from,
  to,
  onFrom,
  onTo,
  fromPlaceholder,
  toPlaceholder,
  maxLength,
}: {
  label: string;
  from: string;
  to: string;
  onFrom: (value: string) => void;
  onTo: (value: string) => void;
  fromPlaceholder: string;
  toPlaceholder: string;
  maxLength?: number;
}) {
  const setDigits =
    (setter: (value: string) => void) =>
    (event: { target: { value: string } }) => {
      const next = sanitizeDigits(event.target.value);
      setter(maxLength ? next.slice(0, maxLength) : next);
    };

  const blockStepping = (event: {
    key: string;
    preventDefault: () => void;
  }) => {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
    }
  };

  return (
    <div className="min-w-0">
      <p className={fieldLabelClass}>{label}</p>
      <div className="grid grid-cols-2 gap-2">
        <Input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          maxLength={maxLength}
          value={from}
          onChange={setDigits(onFrom)}
          onKeyDown={blockStepping}
          placeholder={fromPlaceholder}
          aria-label={`${label} ${fromPlaceholder}`}
          className="bg-secondary"
        />
        <Input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          maxLength={maxLength}
          value={to}
          onChange={setDigits(onTo)}
          onKeyDown={blockStepping}
          placeholder={toPlaceholder}
          aria-label={`${label} ${toPlaceholder}`}
          className="bg-secondary"
        />
      </div>
    </div>
  );
}

const folderNestClass =
  "mt-3 border-l-2 border-border pl-3 sm:mt-4 sm:pl-4";

const folderCardClass = (
  active: boolean,
  tone: "outline" | "fill",
  size: "sm" | "md" | "lg"
) =>
  cn(
    "relative flex shrink-0 flex-col items-start rounded-sm border px-3 text-left shadow-sm transition-colors",
    size === "sm" && "w-[8.5rem] gap-1 py-2 sm:w-[9.5rem]",
    size === "md" && "w-[9.5rem] gap-1.5 py-2.5 sm:w-[10.5rem] sm:py-3",
    size === "lg" &&
      "w-[9.5rem] gap-2.5 py-3 sm:w-[10.5rem] sm:gap-3 sm:px-4 sm:py-4",
    tone === "fill"
      ? active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border bg-background text-muted-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground"
      : active
        ? "border-foreground bg-background text-foreground"
        : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground"
  );

const folderRowClass =
  "-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 md:flex-wrap md:overflow-visible md:pb-0 [&::-webkit-scrollbar]:hidden";

function FinderFolderCard({
  name,
  count,
  active,
  onClick,
  tone = "outline",
  size = "md",
}: {
  name: string;
  count: number;
  active: boolean;
  onClick: () => void;
  tone?: "outline" | "fill";
  size?: "sm" | "md" | "lg";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={folderCardClass(active, tone, size)}
    >
      <span
        className={cn(
          "font-medium leading-snug",
          size === "sm" ? "text-xs" : "text-sm"
        )}
      >
        {name}
      </span>
      <span
        className={cn(
          "font-mono text-[10px] tabular-nums tracking-wide",
          tone === "fill"
            ? "opacity-80"
            : active
              ? "text-foreground"
              : "text-muted-foreground"
        )}
      >
        {count}
      </span>
    </button>
  );
}

function selectOptionsForHierarchy(
  facet: HomeFinderFacet,
  parentChipValue: string | null
): HomeFinderFacetOption[] {
  if (!facet.dependsOnKey) return facet.options;
  if (!parentChipValue) return [];
  return facet.options.filter(
    (option) => option.parentSlug === parentChipValue
  );
}

function FacetField({
  facet,
  chipValue,
  parentChipValue,
  onChip,
  rangeFrom,
  rangeTo,
  onRangeFrom,
  onRangeTo,
  allLabel,
  fromPlaceholder,
  toPlaceholder,
}: {
  facet: HomeFinderFacet;
  chipValue: string | null;
  /** Parent SELECT value when this facet has dependsOnKey (catalog cascade). */
  parentChipValue?: string | null;
  onChip: (slug: string | null) => void;
  rangeFrom: string;
  rangeTo: string;
  onRangeFrom: (value: string) => void;
  onRangeTo: (value: string) => void;
  allLabel: string;
  fromPlaceholder: string;
  toPlaceholder: string;
}) {
  if (facet.type === "NUMBER" || facet.type === "YEAR") {
    return (
      <RangeInputs
        label={facet.unit ? `${facet.name}, ${facet.unit}` : facet.name}
        from={rangeFrom}
        to={rangeTo}
        onFrom={onRangeFrom}
        onTo={onRangeTo}
        fromPlaceholder={fromPlaceholder}
        toPlaceholder={toPlaceholder}
        maxLength={facet.type === "YEAR" ? 4 : undefined}
      />
    );
  }

  if (facet.type === "BOOLEAN") {
    return (
      <div className="min-w-0">
        <p className={fieldLabelClass}>{facet.name}</p>
        <div className={chipRowClass}>
          <button
            type="button"
            onClick={() => onChip(null)}
            className={chipClass(chipValue === null)}
          >
            {allLabel}
          </button>
          <button
            type="button"
            onClick={() =>
              onChip(chipValue === "true" ? null : "true")
            }
            className={chipClass(chipValue === "true")}
          >
            {facet.options[0]?.label ?? "Yes"}
          </button>
        </div>
      </div>
    );
  }

  const options = selectOptionsForHierarchy(
    facet,
    parentChipValue ?? null
  );

  return (
    <div className="min-w-0">
      <p className={fieldLabelClass}>{facet.name}</p>
      <div className={chipRowClass}>
        <button
          type="button"
          onClick={() => onChip(null)}
          className={chipClass(chipValue === null)}
        >
          {allLabel}
        </button>
        {options.map((option) => (
          <button
            key={option.slug}
            type="button"
            onClick={() =>
              onChip(chipValue === option.slug ? null : option.slug)
            }
            className={chipClass(chipValue === option.slug)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Filter UI only — shell/background lives in CatalogBlock. */
export default function CategoryFinderPanel({
  payload,
}: {
  payload: HomeFinderPayload;
}) {
  const t = useTranslations("CategoryFinder");
  const defaults = resolveHomeFinderDefaults(payload);
  const roots = payload.roots;

  const [selectedRootId, setSelectedRootId] = useState<string | null>(
    defaults.rootId
  );
  const [selectedChildId, setSelectedChildId] = useState<string | null>(
    defaults.childId
  );
  const [selectedGrandchildId, setSelectedGrandchildId] = useState<
    string | null
  >(defaults.grandchildId);
  const [chipFacets, setChipFacets] = useState<Record<string, string | null>>(
    {}
  );
  const [rangeFrom, setRangeFrom] = useState<Record<string, string>>({});
  const [rangeTo, setRangeTo] = useState<Record<string, string>>({});

  const selectedRoot: HomeFinderRoot | null = useMemo(() => {
    if (roots.length === 0) return null;
    return (
      roots.find((root) => root.id === selectedRootId) ?? roots[0] ?? null
    );
  }, [roots, selectedRootId]);

  const children = selectedRoot?.children ?? [];
  /** Leaf root: children is [self] — show only one card row (roots or self), not a duplicate. */
  const childIsSelf =
    Boolean(selectedRoot) &&
    children.length === 1 &&
    children[0]?.id === selectedRoot?.id;
  const showChildRow = children.length > 0 && !childIsSelf;

  const selectedChild: HomeFinderChild | null = useMemo(() => {
    if (children.length === 0) return null;
    return (
      children.find((child) => child.id === selectedChildId) ??
      children[0] ??
      null
    );
  }, [children, selectedChildId]);

  const grandchildren = selectedChild?.children ?? [];
  const showGrandchildRow = grandchildren.length > 0;

  const selectedGrandchild: HomeFinderChild | null = useMemo(() => {
    if (grandchildren.length === 0) return null;
    return (
      grandchildren.find((child) => child.id === selectedGrandchildId) ??
      grandchildren[0] ??
      null
    );
  }, [grandchildren, selectedGrandchildId]);

  /** Deepest selected folder drives facets / CTA (catalog folder semantics). */
  const activeFolder = selectedGrandchild ?? selectedChild;

  const scopedFacets = useMemo(() => {
    const next: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(chipFacets)) {
      if (value) next[key] = [value];
    }
    return next;
  }, [chipFacets]);

  const scopedRanges = useMemo(() => {
    const next: Record<string, CatalogRange> = {};
    for (const [key, fromRaw] of Object.entries(rangeFrom)) {
      const from = parsePositiveInt(fromRaw);
      const to = parsePositiveInt(rangeTo[key] ?? "");
      if (from != null || to != null) {
        next[key] = { min: from, max: to };
      }
    }
    return next;
  }, [rangeFrom, rangeTo]);

  /** Same narrowing as catalog filter — options/bounds from published products. */
  const facets = useMemo(() => {
    const base = activeFolder?.facets ?? [];
    if (!activeFolder || base.length === 0) return base;
    const narrowed = narrowFacetsForFolder(
      activeFolder.slug,
      base,
      scopedFacets,
      scopedRanges,
      payload.availability
    );
    return narrowed.facets as HomeFinderFacet[];
  }, [activeFolder, scopedFacets, scopedRanges, payload.availability]);

  /**
   * Homepage plate chip rows: SELECT/BOOLEAN in catalog dependency order.
   * Dependent SELECT appears only after parent is chosen (make → model).
   */
  const chipFacetsList = useMemo(() => {
    return facets.filter((facet) => {
      if (facet.type !== "SELECT" && facet.type !== "BOOLEAN") return false;
      if (facet.type === "BOOLEAN") return facet.options.length > 0;
      if (!facet.dependsOnKey) return facet.options.length > 0;
      const parentValue = chipFacets[facet.dependsOnKey] ?? null;
      if (!parentValue) return false;
      return selectOptionsForHierarchy(facet, parentValue).length > 0;
    });
  }, [facets, chipFacets]);

  function setChipWithHierarchy(key: string, slug: string | null) {
    setChipFacets((current) => {
      const merged: Record<string, string | null> = { ...current, [key]: slug };
      const bucket: Record<string, string[]> = {};
      for (const [facetKey, value] of Object.entries(merged)) {
        if (value) bucket[facetKey] = [value];
      }
      const pruned = pruneDependentFacetValues(
        facets as PublicFilterFacet[],
        bucket
      );
      /** Drop children when parent is empty (catalog prune skips that case). */
      for (const facet of facets) {
        if (!facet.dependsOnKey) continue;
        if (!(pruned[facet.dependsOnKey]?.length)) {
          delete pruned[facet.key];
        }
      }
      const next: Record<string, string | null> = {};
      for (const facet of facets) {
        if (facet.type !== "SELECT" && facet.type !== "BOOLEAN") continue;
        next[facet.key] = pruned[facet.key]?.[0] ?? null;
      }
      return next;
    });
  }
  const rangeFacets = (() => {
    const ranges = facets.filter(
      (facet) => facet.type === "NUMBER" || facet.type === "YEAR"
    );
    const rank = (facet: HomeFinderFacet) => {
      if (facet.key === "year" || facet.type === "YEAR") return 0;
      if (
        facet.key === "mileage" ||
        facet.key === "km" ||
        facet.key.includes("prob") ||
        facet.key.includes("mile")
      ) {
        return 1;
      }
      return 2;
    };
    return [...ranges].sort((a, b) => rank(a) - rank(b));
  })();
  /** Pack ranges into rows of up to 3; leave room for CTA on the last partial row. */
  const rangeRows = (() => {
    const rows: HomeFinderFacet[][] = [];
    let index = 0;
    while (index < rangeFacets.length) {
      const left = rangeFacets.length - index;
      if (left >= 3) {
        rows.push(rangeFacets.slice(index, index + 3));
        index += 3;
      } else {
        rows.push(rangeFacets.slice(index));
        break;
      }
    }
    return rows;
  })();
  const lastRangeRow = rangeRows[rangeRows.length - 1] ?? [];
  const ctaWithRanges =
    chipFacetsList.length > 0 || rangeFacets.length > 0;
  const ctaColSpan =
    rangeFacets.length === 0
      ? 12
      : lastRangeRow.length >= 3
        ? 12
        : 12 - lastRangeRow.length * 4;
  const ctaOnNewRow = rangeFacets.length > 0 && lastRangeRow.length >= 3;

  const count =
    activeFolder?.productCount ?? selectedRoot?.productCount ?? 0;

  const href = useMemo(() => {
    if (!activeFolder) return "/products";
    const ranges: Record<string, { from?: number; to?: number }> = {};
    for (const facet of facets) {
      if (facet.type !== "NUMBER" && facet.type !== "YEAR") continue;
      const from = parsePositiveInt(rangeFrom[facet.key] ?? "");
      const to = parsePositiveInt(rangeTo[facet.key] ?? "");
      if (from != null || to != null) {
        ranges[facet.key] = { from, to };
      }
    }
    return buildHomeFinderProductsHref({
      folderSlug: activeFolder.slug,
      facets: chipFacets,
      ranges,
    });
  }, [activeFolder, facets, chipFacets, rangeFrom, rangeTo]);

  function resetFacets() {
    setChipFacets({});
    setRangeFrom({});
    setRangeTo({});
  }

  function selectRoot(root: HomeFinderRoot) {
    setSelectedRootId(root.id);
    const firstChild = root.children[0] ?? null;
    setSelectedChildId(firstChild?.id ?? null);
    setSelectedGrandchildId(firstChild?.children[0]?.id ?? null);
    resetFacets();
  }

  function selectChild(child: HomeFinderChild) {
    setSelectedChildId(child.id);
    setSelectedGrandchildId(child.children[0]?.id ?? null);
    resetFacets();
  }

  function selectGrandchild(child: HomeFinderChild) {
    setSelectedGrandchildId(child.id);
    resetFacets();
  }

  const showRoots =
    (payload.showRootsBlock || childIsSelf || !showChildRow) &&
    roots.length > 0;

  return (
    <div>
      <SectionIntro
        eyebrow={t("eyebrow")}
        title={t("title")}
        align="start"
        className="mb-8 lg:mb-10"
      />

      {showRoots || showChildRow || showGrandchildRow ? (
        <div className="mb-5 md:mb-6">
          {showRoots ? (
            <>
              <p className={fieldLabelClass}>{t("catalogLabel")}</p>
              <div
                className={folderRowClass}
                style={{ scrollbarWidth: "none" }}
              >
                {roots.map((root) => (
                  <FinderFolderCard
                    key={root.id}
                    name={root.name}
                    count={root.productCount}
                    active={selectedRoot?.id === root.id}
                    onClick={() => selectRoot(root)}
                    tone="fill"
                    size="sm"
                  />
                ))}
              </div>
            </>
          ) : null}

          {showChildRow || showGrandchildRow ? (
            <div className={showRoots ? folderNestClass : undefined}>
              {showChildRow ? (
                <div
                  className={folderRowClass}
                  style={{ scrollbarWidth: "none" }}
                >
                  {children.map((child) => (
                    <FinderFolderCard
                      key={child.id}
                      name={child.name}
                      count={child.productCount}
                      active={selectedChild?.id === child.id}
                      onClick={() => selectChild(child)}
                      tone="fill"
                      size="md"
                    />
                  ))}
                </div>
              ) : null}

              {showGrandchildRow ? (
                <div
                  className={
                    showChildRow || showRoots ? folderNestClass : undefined
                  }
                >
                  <div
                    className={folderRowClass}
                    style={{ scrollbarWidth: "none" }}
                  >
                    {grandchildren.map((child) => (
                      <FinderFolderCard
                        key={child.id}
                        name={child.name}
                        count={child.productCount}
                        active={selectedGrandchild?.id === child.id}
                        onClick={() => selectGrandchild(child)}
                        size="lg"
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {roots.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("emptyChildren")}</p>
      ) : null}

      <div className="mt-6 rounded-sm border border-border bg-background p-4 shadow-sm md:mt-8 md:p-5">
        {facets.length === 0 ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <p className="text-sm text-muted-foreground">{t("emptyFacets")}</p>
            <Button asChild className="w-full sm:w-auto sm:min-w-[14rem]">
              <Link href={href}>
                {t("cta", { count })}
                <LuChevronRight aria-hidden />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {chipFacetsList.map((facet) => (
              <FacetField
                key={facet.key}
                facet={facet}
                chipValue={chipFacets[facet.key] ?? null}
                parentChipValue={
                  facet.dependsOnKey
                    ? (chipFacets[facet.dependsOnKey] ?? null)
                    : null
                }
                onChip={(slug) => setChipWithHierarchy(facet.key, slug)}
                rangeFrom=""
                rangeTo=""
                onRangeFrom={() => undefined}
                onRangeTo={() => undefined}
                allLabel={
                  facet.key === "make" || facet.key === "brand"
                    ? t("allBrands")
                    : t("allOption")
                }
                fromPlaceholder={t("rangeFrom")}
                toPlaceholder={t("rangeTo")}
              />
            ))}

            {rangeRows.map((row, rowIndex) => {
              const isLast = rowIndex === rangeRows.length - 1;
              const showCtaHere = isLast && ctaWithRanges && !ctaOnNewRow;
              return (
                <div
                  key={row.map((facet) => facet.key).join("-")}
                  className="grid gap-5 sm:grid-cols-2 lg:grid-cols-12 lg:items-end"
                >
                  {row.map((facet) => (
                    <div key={facet.key} className="lg:col-span-4">
                      <FacetField
                        facet={facet}
                        chipValue={null}
                        onChip={() => undefined}
                        rangeFrom={rangeFrom[facet.key] ?? ""}
                        rangeTo={rangeTo[facet.key] ?? ""}
                        onRangeFrom={(value) =>
                          setRangeFrom((current) => ({
                            ...current,
                            [facet.key]: value,
                          }))
                        }
                        onRangeTo={(value) =>
                          setRangeTo((current) => ({
                            ...current,
                            [facet.key]: value,
                          }))
                        }
                        allLabel={t("allOption")}
                        fromPlaceholder={t("rangeFrom")}
                        toPlaceholder={t("rangeTo")}
                      />
                    </div>
                  ))}
                  {showCtaHere ? (
                    <div
                      className={cn(
                        "sm:col-span-2",
                        ctaColSpan === 12
                          ? "lg:col-span-12"
                          : ctaColSpan === 8
                            ? "lg:col-span-8"
                            : "lg:col-span-4"
                      )}
                    >
                      <Button asChild className="w-full">
                        <Link href={href}>
                          {t("cta", { count })}
                          <LuChevronRight aria-hidden />
                        </Link>
                      </Button>
                    </div>
                  ) : null}
                </div>
              );
            })}

            {ctaWithRanges && (rangeFacets.length === 0 || ctaOnNewRow) ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-12 lg:items-end">
                <div
                  className={cn(
                    "sm:col-span-2",
                    ctaColSpan === 12
                      ? "lg:col-span-12"
                      : ctaColSpan === 8
                        ? "lg:col-span-8"
                        : "lg:col-span-4"
                  )}
                >
                  <Button asChild className="w-full">
                    <Link href={href}>
                      {t("cta", { count })}
                      <LuChevronRight aria-hidden />
                    </Link>
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

