"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import type {
  PublicFilterFacet,
  PublicFilterNode,
  PublicFilterOption,
} from "@/lib/catalog/public-filter";
import { useEdgeMenuAlign } from "@/lib/use-edge-menu-align";
import { cn } from "@/lib/utils";
import type { CatalogRange } from "@/utils/catalog-query";
import { useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { LuChevronDown } from "react-icons/lu";

/** Visible thin scroll — paired with `.app-scroll` in globals.css. */
export const FILTER_SCROLL_CLASS = "app-scroll";

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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { align, onOpenChange, collisionPadding } = useEdgeMenuAlign("start");
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
  const menuOptions = visible;
  const count = selected.length;
  const summary =
    count === 0
      ? facet.name
      : count === 1
        ? (facet.options.find((item) => item.slug === selected[0])?.label ??
          facet.name)
        : `${facet.name} · ${count}`;

  return (
    <DropdownMenu
      modal={false}
      onOpenChange={(open) => onOpenChange(open, triggerRef.current)}
    >
      <DropdownMenuTrigger asChild>
        <Button
          ref={triggerRef}
          type="button"
          variant="outline"
          className={cn(
            "h-10 w-full justify-between border-border/70 px-3 text-sm font-normal tracking-normal",
            count > 0 && "border-foreground/30"
          )}
        >
          <span className="min-w-0 truncate text-left">{summary}</span>
          <LuChevronDown className="size-4 shrink-0 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        collisionPadding={collisionPadding}
        className="min-w-0 w-[var(--radix-dropdown-menu-trigger-width)]"
      >
        {menuOptions.length === 0 ? (
          <p className="px-2 py-1.5 text-sm text-muted-foreground">—</p>
        ) : (
          groups.map((group, index) => (
            <div key={group.key}>
              {showHeadings && group.label ? (
                <>
                  {index > 0 ? <DropdownMenuSeparator /> : null}
                  <DropdownMenuLabel className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {group.label}
                  </DropdownMenuLabel>
                </>
              ) : null}
              {group.options.map((option) => {
                const checked = selected.includes(option.slug);
                return (
                  <DropdownMenuCheckboxItem
                    key={`${group.key}-${option.slug}`}
                    checked={checked}
                    onCheckedChange={(value) =>
                      onToggle(option.slug, value === true)
                    }
                    onSelect={(event) => event.preventDefault()}
                  >
                    {option.label}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </div>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

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
          className={cn("h-10 rounded-sm border-border/70", filled && "border-foreground/30")}
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
          className={cn("h-10 rounded-sm border-border/70", filled && "border-foreground/30")}
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
    <div className="mt-3 grid gap-3 border-t border-border/40 pt-3">
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
  selected,
  initialOpenSlug,
  scopedFacets,
  scopedRanges,
  labels,
  idPrefix,
  onSelectFolder,
  onToggleFacet,
  onSetRange,
}: FilterTreeProps & { depth: number }) {
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
    <div className="grid w-full gap-3">
      {nodes.map((node) => {
        const isLeaf = node.children.length === 0;
        const isSelected = selected.includes(node.slug);
        const isOpen = openSlug === node.slug;
        const active = isOpen || isSelected;
        return (
          <div key={node.id} className="grid">
            <Button
              type="button"
              variant="ghost"
              aria-expanded={isOpen}
              aria-pressed={isSelected}
              aria-label={`${isOpen ? labels.collapse : labels.expand}: ${node.name}`}
              className={cn(
                "h-10 w-full justify-between gap-2 px-3 text-sm font-medium tracking-normal",
                active && "bg-muted/70 font-semibold text-foreground",
                depth === 1 && "pl-5",
                depth === 2 && "pl-8",
                depth >= 3 && "pl-11"
              )}
              onClick={() => {
                if (isOpen) {
                  setOpenSlug(undefined);
                  setChildEpoch((epoch) => epoch + 1);
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
            <div
              className={cn(
                "grid transition-[grid-template-rows] duration-200 ease-out",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              )}
            >
              <div className="min-h-0 overflow-hidden">
                <div className={cn("pb-1 pt-3", depth === 0 && "pl-1", depth >= 1 && "pl-2")}>
                  {isLeaf ? (
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
                  ) : (
                    <CatalogFilterBranch
                      key={`${node.slug}-${childEpoch}`}
                      nodes={node.children}
                      depth={depth + 1}
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
