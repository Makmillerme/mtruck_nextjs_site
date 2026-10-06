"use client";

import { SHEET_COMBOBOX_SEARCH_MIN } from "@/components/admin/searchable-entity-picker";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import type {
  PublicFilterFacet,
  PublicFilterNode,
  PublicFilterOption,
} from "@/lib/catalog/public-filter";
import { sheetFieldTriggerClassName } from "@/lib/ui/sheet-field";
import { cn } from "@/lib/utils";
import type { CatalogRange } from "@/utils/catalog-query";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import {
  LuCheck,
  LuChevronDown,
  LuChevronsUpDown,
  LuSearch,
} from "react-icons/lu";

/** Visible thin scroll — paired with `.app-scroll` in globals.css. */
export const FILTER_SCROLL_CLASS = "app-scroll";

/**
 * Hairlines via border (not bg on h-px/w-px): at DPR 1.25 a 1px
 * background often rounds to 1 or 2 device px depending on offset,
 * so separators looked thicker/thinner when the accordion reflowed.
 */
const FILTER_RULE_H = "h-0 w-full shrink-0 border-t border-border";
const FILTER_RULE_V = "w-0 shrink-0 self-stretch border-l border-border";

export type FilterTreeLabels = {
  from: string;
  to: string;
  empty: string;
  expand: string;
  collapse: string;
};

export type FilterTreeProps = {
  nodes: PublicFilterNode[];
  selected: string[];
  initialOpenSlug?: string | null;
  scopedFacets: Record<string, Record<string, string[]>>;
  scopedRanges: Record<string, Record<string, CatalogRange>>;
  labels: FilterTreeLabels;
  idPrefix: string;
  onSelectFolder: (slug: string) => void;
  onToggleFacet: (
    folderSlug: string,
    key: string,
    value: string,
    checked: boolean
  ) => void;
  onSetRange: (folderSlug: string, key: string, range: CatalogRange) => void;
};

export function nodeContainsSlug(node: PublicFilterNode, slug: string): boolean {
  if (node.slug === slug) return true;
  return node.children.some((child) => nodeContainsSlug(child, slug));
}

/** True if slug is under node (children only — not self). */
export function nodeHasDescendantSlug(
  node: PublicFilterNode,
  slug: string
): boolean {
  return node.children.some((child) => nodeContainsSlug(child, slug));
}

function groupOptions(
  options: PublicFilterOption[],
  parentOptions: PublicFilterOption[]
) {
  const byParent = new Map<string | null, PublicFilterOption[]>();
  for (const option of options) {
    const key = option.parentSlug;
    const list = byParent.get(key) ?? [];
    list.push(option);
    byParent.set(key, list);
  }

  const groups: {
    key: string;
    label: string | null;
    options: PublicFilterOption[];
  }[] = [];
  const used = new Set<string | null>();

  const ungrouped = byParent.get(null);
  if (ungrouped?.length) {
    groups.push({ key: "_", label: null, options: ungrouped });
    used.add(null);
  }

  for (const parent of parentOptions) {
    const list = byParent.get(parent.slug);
    if (!list?.length) continue;
    groups.push({
      key: parent.slug,
      label: parent.label,
      options: list,
    });
    used.add(parent.slug);
  }

  for (const [slug, list] of byParent) {
    if (used.has(slug) || !list.length) continue;
    groups.push({
      key: slug ?? "_",
      label: slug,
      options: list,
    });
  }

  return groups;
}

function FacetDropdown({
  facet,
  selected,
  parentSelected,
  parentOptions,
  onToggle,
}: {
  facet: PublicFilterFacet;
  selected: string[];
  parentSelected: string[];
  parentOptions: PublicFilterOption[];
  onToggle: (value: string, checked: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const visible = facet.dependsOnKey
    ? parentSelected.length
      ? facet.options.filter(
          (option) =>
            option.parentSlug != null &&
            parentSelected.includes(option.parentSlug)
        )
      : facet.options
    : facet.options;

  const groups = groupOptions(visible, parentOptions);
  const showHeadings = groups.some((group) => group.label);
  const count = selected.length;
  const summary =
    count === 0
      ? facet.name
      : count === 1
        ? (facet.options.find((item) => item.slug === selected[0])?.label ??
          facet.name)
        : `${facet.name} · ${count}`;

  const showSearch = visible.length >= SHEET_COMBOBOX_SEARCH_MIN;
  const queryTrimmed = query.trim().toLocaleLowerCase();

  const filteredGroups =
    !showSearch || !queryTrimmed
      ? groups
      : groups
          .map((group) => ({
            ...group,
            options: group.options.filter((option) => {
              const hay = [option.label, option.slug, group.label ?? ""]
                .join(" ")
                .toLocaleLowerCase();
              return hay.includes(queryTrimmed);
            }),
          }))
          .filter((group) => group.options.length > 0);

  return (
    <Popover
      modal={false}
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            sheetFieldTriggerClassName,
            count > 0 && "border-foreground/30"
          )}
        >
          <span className="min-w-0 truncate text-left">{summary}</span>
          <LuChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="z-[200] w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        onOpenAutoFocus={(event) => {
          if (!showSearch) event.preventDefault();
        }}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <Command shouldFilter={false} className="rounded-sm border-0">
          {showSearch ? (
            <div className="flex items-center gap-2 border-b px-3">
              <LuSearch
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <Input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => event.stopPropagation()}
                placeholder={facet.name}
                className="h-10 border-0 bg-transparent px-0 text-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-0"
                aria-label={facet.name}
              />
            </div>
          ) : null}
          <CommandList>
            <CommandEmpty>—</CommandEmpty>
            {filteredGroups.map((group, index) => (
              <div key={group.key}>
                {showHeadings && group.label ? (
                  <>
                    {index > 0 ? <CommandSeparator /> : null}
                    <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {group.label}
                    </p>
                  </>
                ) : null}
                <CommandGroup>
                  {group.options.map((option) => {
                    const checked = selected.includes(option.slug);
                    return (
                      <CommandItem
                        key={`${group.key}-${option.slug}`}
                        value={option.slug}
                        keywords={[option.label]}
                        onMouseDown={(event) => event.preventDefault()}
                        onSelect={() => onToggle(option.slug, !checked)}
                      >
                        <LuCheck
                          className={cn(
                            "mr-2 size-4",
                            checked ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <span className="truncate">{option.label}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </div>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Numeric from/to + slider — catalog facets (year, mileage, power).
 * Calendar dates use SheetDateField (`components/form/sheet-date-field.tsx`).
 */
function RangeFacet({
  facet,
  range,
  labels,
  onChange,
}: {
  facet: PublicFilterFacet;
  range: CatalogRange;
  labels: FilterTreeLabels;
  onChange: (range: CatalogRange) => void;
}) {
  const boundMin = facet.minBound ?? 0;
  const rawMax = facet.maxBound ?? Math.max(boundMin + 1, 100);
  const boundMax = rawMax <= boundMin ? boundMin + 1 : rawMax;
  const [local, setLocal] = useState<CatalogRange>(range);
  const [prevRange, setPrevRange] = useState(range);

  if (range.min !== prevRange.min || range.max !== prevRange.max) {
    setPrevRange(range);
    setLocal(range);
  }

  const apply = useDebouncedCallback((next: CatalogRange) => {
    onChange(next);
  }, 400);

  const filled = local.min != null || local.max != null;
  const sliderLow = local.min ?? boundMin;
  const sliderHigh = local.max ?? boundMax;

  function commit(next: CatalogRange) {
    setLocal(next);
    apply(next);
  }

  return (
    <div className="grid gap-2">
      <p className="text-sm text-muted-foreground">
        {facet.name}
        {facet.unit ? `, ${facet.unit}` : null}
      </p>
      <div className="grid grid-cols-2 gap-2">
        <Input
          type="text"
          inputMode="numeric"
          value={local.min ?? ""}
          placeholder={labels.from}
          aria-label={`${facet.name} ${labels.from}`}
          className={cn("h-11 rounded-sm border-border/70", filled && "border-foreground/30")}
          onChange={(event) => {
            const raw = event.target.value.replace(/\D/g, "");
            commit({
              min: raw ? Number(raw) : undefined,
              max: local.max,
            });
          }}
        />
        <Input
          type="text"
          inputMode="numeric"
          value={local.max ?? ""}
          placeholder={labels.to}
          aria-label={`${facet.name} ${labels.to}`}
          className={cn("h-11 rounded-sm border-border/70", filled && "border-foreground/30")}
          onChange={(event) => {
            const raw = event.target.value.replace(/\D/g, "");
            commit({
              min: local.min,
              max: raw ? Number(raw) : undefined,
            });
          }}
        />
      </div>
      <Slider
        min={boundMin}
        max={boundMax}
        step={1}
        value={[
          Math.min(sliderLow, sliderHigh),
          Math.max(sliderLow, sliderHigh),
        ]}
        onValueChange={([min, max]) => {
          commit({ min, max });
        }}
        className="mt-1"
        aria-label={facet.name}
      />
    </div>
  );
}

function FacetFields({
  folderSlug,
  facets,
  idPrefix,
  scopedFacets,
  scopedRanges,
  labels,
  onToggleFacet,
  onSetRange,
}: {
  folderSlug: string;
  facets: PublicFilterFacet[];
  idPrefix: string;
  scopedFacets: Record<string, string[]>;
  scopedRanges: Record<string, CatalogRange>;
  labels: FilterTreeLabels;
  onToggleFacet: FilterTreeProps["onToggleFacet"];
  onSetRange: FilterTreeProps["onSetRange"];
}) {
  if (facets.length === 0) {
    return <p className="text-sm text-muted-foreground">{labels.empty}</p>;
  }

  const byKey = new Map(facets.map((facet) => [facet.key, facet]));

  return (
    <div className="grid gap-3">
      {facets.map((facet) => {
        if (facet.type === "NUMBER" || facet.type === "YEAR") {
          return (
            <RangeFacet
              key={`${folderSlug}-${facet.key}`}
              facet={facet}
              range={scopedRanges[facet.key] ?? {}}
              labels={labels}
              onChange={(range) => onSetRange(folderSlug, facet.key, range)}
            />
          );
        }

        if (facet.type === "BOOLEAN") {
          const id = `${idPrefix}-bool-${facet.key}`;
          const checked = (scopedFacets[facet.key] ?? []).includes("1");
          return (
            <label
              key={facet.key}
              htmlFor={id}
              className="flex cursor-pointer items-center gap-3 text-sm"
            >
              <Checkbox
                id={id}
                checked={checked}
                onCheckedChange={(value) =>
                  onToggleFacet(folderSlug, facet.key, "1", value === true)
                }
              />
              {facet.name}
            </label>
          );
        }

        const parentFacet = facet.dependsOnKey
          ? byKey.get(facet.dependsOnKey)
          : undefined;

        return (
          <FacetDropdown
            key={facet.key}
            facet={facet}
            selected={scopedFacets[facet.key] ?? []}
            parentSelected={
              facet.dependsOnKey
                ? (scopedFacets[facet.dependsOnKey] ?? [])
                : []
            }
            parentOptions={parentFacet?.options ?? []}
            onToggle={(value, next) =>
              onToggleFacet(folderSlug, facet.key, value, next)
            }
          />
        );
      })}
    </div>
  );
}

function CatalogFilterBranch({
  nodes,
  depth,
  parentSlug,
  selected,
  initialOpenSlug,
  scopedFacets,
  scopedRanges,
  labels,
  idPrefix,
  onSelectFolder,
  onToggleFacet,
  onSetRange,
}: FilterTreeProps & { depth: number; parentSlug?: string }) {
  const defaultOpen = initialOpenSlug
    ? nodes.find((node) => nodeContainsSlug(node, initialOpenSlug))?.slug
    : undefined;
  const [openSlug, setOpenSlug] = useState<string | undefined>(defaultOpen);
  /** Bump when collapsing a node so nested branches remount closed. */
  const [childEpoch, setChildEpoch] = useState(0);
  const [prevInitial, setPrevInitial] = useState(initialOpenSlug);

  if (initialOpenSlug !== prevInitial) {
    setPrevInitial(initialOpenSlug);
    const nextOpen = initialOpenSlug
      ? nodes.find((node) => nodeContainsSlug(node, initialOpenSlug))?.slug
      : undefined;
    setOpenSlug(nextOpen);
    // URL/draft moved to another branch — drop nested open state.
    if (!nextOpen || nextOpen !== openSlug) {
      setChildEpoch((epoch) => epoch + 1);
    }
  }

  if (nodes.length === 0) return null;

  const selectFolder =
    typeof onSelectFolder === "function" ? onSelectFolder : () => undefined;

  return (
    <div className="grid w-full">
      {nodes.map((node, index) => {
        const isLeaf = node.children.length === 0;
        const isSelected = selected.includes(node.slug);
        const hasSelectedDescendant =
          !isLeaf &&
          selected.some((slug) => nodeHasDescendantSlug(node, slug));
        const hasOpenDescendant =
          !isLeaf &&
          openSlug != null &&
          nodeHasDescendantSlug(node, openSlug);
        /** Keep ancestors + selected leaf expanded so nested facets stay usable. */
        const isOpen =
          openSlug === node.slug ||
          (isLeaf && isSelected) ||
          hasSelectedDescendant ||
          hasOpenDescendant;
        const active = isOpen || isSelected;
        return (
          <div key={node.id} className="grid">
            {index > 0 ? (
              <div className="py-1.5" aria-hidden>
                <div className={FILTER_RULE_H} />
              </div>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              aria-expanded={isOpen}
              aria-pressed={isSelected}
              aria-label={`${isOpen ? labels.collapse : labels.expand}: ${node.name}`}
              className={cn(
                "h-10 w-full justify-between gap-2 px-3 text-sm font-medium tracking-normal hover:bg-foreground/10 hover:text-inherit aria-expanded:bg-foreground/10 aria-expanded:font-semibold aria-expanded:text-foreground",
                active && "bg-foreground/10 font-semibold text-foreground",
                depth === 1 && "pl-5",
                depth === 2 && "pl-8",
                depth >= 3 && "pl-11"
              )}
              onClick={() => {
                if (isOpen) {
                  setOpenSlug(undefined);
                  setChildEpoch((epoch) => epoch + 1);
                  // Keep ancestors open: collapse only this node; move
                  // selection to parent (root → clear) when it owns selection.
                  const selectionUnderNode =
                    isSelected ||
                    selected.some((slug) =>
                      nodeHasDescendantSlug(node, slug)
                    );
                  if (selectionUnderNode) {
                    selectFolder(parentSlug ?? "");
                  }
                  return;
                }
                setOpenSlug(node.slug);
                selectFolder(node.slug);
              }}
            >
              <span className="min-w-0 truncate text-left">{node.name}</span>
              <LuChevronDown
                className={cn(
                  "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              />
            </Button>
            {/* Outside grid-rows anim — keeps 1px hairline from being squashed. */}
            {!isLeaf && isOpen ? (
              <div className={cn(FILTER_RULE_H, "my-1.5")} aria-hidden />
            ) : null}
            <div
              className={cn(
                "grid overflow-hidden transition-[grid-template-rows] duration-200 ease-out",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              )}
              // Keep closed panels out of a11y + hit-testing (ghost facets looked "dead").
              inert={isOpen ? undefined : true}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="p-px">
                {isLeaf ? (
                  <div className="flex gap-3 pb-1 pt-3">
                    <div className={FILTER_RULE_V} aria-hidden />
                    <div className="min-w-0 flex-1">
                      <FacetFields
                        folderSlug={node.slug}
                        facets={node.facets}
                        idPrefix={`${idPrefix}-${node.slug}`}
                        scopedFacets={scopedFacets[node.slug] ?? {}}
                        scopedRanges={scopedRanges[node.slug] ?? {}}
                        labels={labels}
                        onToggleFacet={onToggleFacet}
                        onSetRange={onSetRange}
                      />
                    </div>
                  </div>
                ) : (
                  <div
                    className={cn(
                      "pb-1",
                      depth === 0 && "pl-1",
                      depth >= 1 && "pl-2"
                    )}
                  >
                    <CatalogFilterBranch
                      key={`${node.slug}-${childEpoch}`}
                      nodes={node.children}
                      depth={depth + 1}
                      parentSlug={node.slug}
                      selected={selected}
                      initialOpenSlug={isOpen ? initialOpenSlug : null}
                      scopedFacets={scopedFacets}
                      scopedRanges={scopedRanges}
                      labels={labels}
                      idPrefix={idPrefix}
                      onSelectFolder={selectFolder}
                      onToggleFacet={onToggleFacet}
                      onSetRange={onSetRange}
                    />
                  </div>
                )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function CatalogFilterTree(props: FilterTreeProps) {
  return <CatalogFilterBranch {...props} depth={0} />;
}
