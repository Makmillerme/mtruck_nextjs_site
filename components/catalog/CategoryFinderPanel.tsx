"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import SectionIntro from "@/components/section-intro";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";
import {
  buildHomeFinderProductsHref,
  resolveHomeFinderDefaults,
  type HomeFinderChild,
  type HomeFinderFacet,
  type HomeFinderPayload,
  type HomeFinderRoot,
} from "@/lib/home/home-finder-shared";
import { cn } from "@/lib/utils";
import { LuChevronRight } from "react-icons/lu";

function sanitizeDigits(value: string) {
  return value.replace(/\D/g, "");
}

const chipClass = (active: boolean) =>
  cn(
    "shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors",
    active
      ? "border-primary bg-primary text-primary-foreground"
      : "border-border bg-secondary text-muted-foreground hover:border-primary/30 hover:text-foreground"
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

const folderCardClass = (active: boolean) =>
  cn(
    "relative flex min-w-[8.5rem] shrink-0 flex-col items-start gap-2.5 rounded-sm border bg-background px-3 py-3 text-left shadow-sm transition-colors sm:min-w-[9.5rem] sm:gap-3 sm:px-4 sm:py-4 md:min-w-0",
    active
      ? "border-foreground text-foreground"
      : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
  );

const folderRowClass =
  "-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 md:grid md:grid-cols-5 md:overflow-visible md:pb-0 [&::-webkit-scrollbar]:hidden";

function FinderFolderCard({
  name,
  count,
  active,
  onClick,
}: {
  name: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={folderCardClass(active)}
    >
      <span className="text-sm font-medium leading-snug text-foreground">
        {name}
      </span>
      <span
        className={cn(
          "font-mono text-[10px] tabular-nums tracking-wide",
          active ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {count}
      </span>
    </button>
  );
}

function FacetField({
  facet,
  chipValue,
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
        {facet.options.map((option) => (
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

  const facets = selectedChild?.facets ?? [];
  /** Homepage plate canon: one chip row (prefer make) + two ranges (prefer year/mileage) + CTA. */
  const chipFacetsList = (() => {
    const chips = facets.filter(
      (facet) => facet.type === "SELECT" || facet.type === "BOOLEAN"
    );
    const preferred =
      chips.find((facet) => facet.key === "make" || facet.key === "brand") ??
      chips[0];
    return preferred ? [preferred] : [];
  })();
  const rangeFacets = (() => {
    const ranges = facets.filter(
      (facet) => facet.type === "NUMBER" || facet.type === "YEAR"
    );
    const year =
      ranges.find((facet) => facet.key === "year" || facet.type === "YEAR") ??
      null;
    const mileage =
      ranges.find(
        (facet) =>
          facet.key === "mileage" ||
          facet.key === "km" ||
          facet.key.includes("prob") ||
          facet.key.includes("mile")
      ) ?? null;
    const picked: HomeFinderFacet[] = [];
    if (year) picked.push(year);
    if (mileage && mileage.key !== year?.key) picked.push(mileage);
    for (const facet of ranges) {
      if (picked.length >= 2) break;
      if (!picked.some((item) => item.key === facet.key)) picked.push(facet);
    }
    return picked;
  })();
  const primaryRanges = rangeFacets;
  const extraRanges: HomeFinderFacet[] = [];

  const count = selectedChild?.productCount ?? selectedRoot?.productCount ?? 0;

  const href = useMemo(() => {
    if (!selectedChild) return "/products";
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
      folderSlug: selectedChild.slug,
      facets: chipFacets,
      ranges,
    });
  }, [selectedChild, facets, chipFacets, rangeFrom, rangeTo]);

  function selectRoot(root: HomeFinderRoot) {
    setSelectedRootId(root.id);
    setSelectedChildId(root.children[0]?.id ?? null);
    setChipFacets({});
    setRangeFrom({});
    setRangeTo({});
  }

  function selectChild(child: HomeFinderChild) {
    setSelectedChildId(child.id);
    setChipFacets({});
    setRangeFrom({});
    setRangeTo({});
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

      {showRoots ? (
        <div className={cn(folderRowClass, "mb-5 md:mb-6")} style={{ scrollbarWidth: "none" }}>
          {roots.map((root) => (
            <FinderFolderCard
              key={root.id}
              name={root.name}
              count={root.productCount}
              active={selectedRoot?.id === root.id}
              onClick={() => selectRoot(root)}
            />
          ))}
        </div>
      ) : null}

      {showChildRow ? (
        <div className={folderRowClass} style={{ scrollbarWidth: "none" }}>
          {children.map((child) => (
            <FinderFolderCard
              key={child.id}
              name={child.name}
              count={child.productCount}
              active={selectedChild?.id === child.id}
              onClick={() => selectChild(child)}
            />
          ))}
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
                onChip={(slug) =>
                  setChipFacets((current) => ({
                    ...current,
                    [facet.key]: slug,
                  }))
                }
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

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-12 lg:items-end">
              {primaryRanges.map((facet) => (
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
              {primaryRanges.length === 0 && chipFacetsList.length === 0 ? null : (
                <div
                  className={cn(
                    "sm:col-span-2",
                    primaryRanges.length === 0
                      ? "lg:col-span-12"
                      : primaryRanges.length === 1
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
              )}
            </div>

            {extraRanges.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-12">
                {extraRanges.map((facet) => (
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
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
