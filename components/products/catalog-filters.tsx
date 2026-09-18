"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type {
  PublicFilterFacet,
  PublicFilterNode,
  PublicFilterSchema,
} from "@/lib/catalog/public-filter";
import { cn } from "@/lib/utils";
import { useRouter } from "@/i18n/navigation";
import {
  buildCatalogHref,
  countActiveCatalogFilters,
  parseCatalogQuery,
  type CatalogRange,
} from "@/utils/catalog-query";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export function useCatalogFilters(schema: PublicFilterSchema) {
  const t = useTranslations("Products");
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = parseCatalogQuery(searchParams);
  const activeCount = countActiveCatalogFilters(query);

  function go(href: string) {
    router.replace(href, { scroll: false });
  }

  function current() {
    return new URLSearchParams(window.location.search);
  }

  /** Selecting a folder replaces the folder filter (one active branch). */
  function selectFolder(slug: string) {
    const params = current();
    // Clear facet params when switching branch so leaf fields don't leak.
    for (const key of [...params.keys()]) {
      if (key.startsWith("f.")) params.delete(key);
    }
    go(
      buildCatalogHref(params, {
        folders: [slug],
        clearFacets: false,
        resetPage: true,
      })
    );
  }

  function toggleFacet(key: string, value: string, checked: boolean) {
    const selected = query.facets[key] ?? [];
    const next = checked
      ? [...selected, value]
      : selected.filter((item) => item !== value);
    go(buildCatalogHref(current(), { facetKey: key, facetValues: next }));
  }

  function setRange(key: string, range: CatalogRange) {
    go(buildCatalogHref(current(), { rangeKey: key, range }));
  }

  function clearFilters() {
    go(buildCatalogHref(current(), { clearFacets: true }));
  }

  return {
    t,
    schema,
    query,
    activeCount,
    selectFolder,
    toggleFacet,
    setRange,
    clearFilters,
  };
}

function RangeFacet({
  facetKey,
  name,
  unit,
  range,
  onChange,
}: {
  facetKey: string;
  name: string;
  unit: string | null;
  range: CatalogRange;
  onChange: (range: CatalogRange) => void;
}) {
  const t = useTranslations("Products");
  const apply = useDebouncedCallback((next: CatalogRange) => {
    onChange(next);
  }, 400);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium">
        {name}
        {unit ? (
          <span className="text-muted-foreground">, {unit}</span>
        ) : null}
      </p>
      <div className="grid grid-cols-2 gap-2">
        <Input
          type="text"
          inputMode="numeric"
          defaultValue={range.min ?? ""}
          placeholder={t("filterFrom")}
          aria-label={`${name} ${t("filterFrom")}`}
          onChange={(event) => {
            const raw = event.target.value.replace(/\D/g, "");
            apply({
              min: raw ? Number(raw) : undefined,
              max: range.max,
            });
          }}
        />
        <Input
          type="text"
          inputMode="numeric"
          defaultValue={range.max ?? ""}
          placeholder={t("filterTo")}
          aria-label={`${name} ${t("filterTo")}`}
          onChange={(event) => {
            const raw = event.target.value.replace(/\D/g, "");
            apply({
              min: range.min,
              max: raw ? Number(raw) : undefined,
            });
          }}
        />
      </div>
    </div>
  );
}

function FacetFields({
  facets,
  idPrefix,
  query,
  toggleFacet,
  setRange,
}: {
  facets: PublicFilterFacet[];
  idPrefix: string;
  query: ReturnType<typeof parseCatalogQuery>;
  toggleFacet: (key: string, value: string, checked: boolean) => void;
  setRange: (key: string, range: CatalogRange) => void;
}) {
  const t = useTranslations("Products");

  if (facets.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{t("filterEmpty")}</p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {facets.map((facet) => {
        if (facet.type === "NUMBER" || facet.type === "YEAR") {
          return (
            <RangeFacet
              key={facet.key}
              facetKey={facet.key}
              name={facet.name}
              unit={facet.unit}
              range={query.ranges[facet.key] ?? {}}
              onChange={(range) => setRange(facet.key, range)}
            />
          );
        }

        if (facet.type === "BOOLEAN") {
          const id = `${idPrefix}-bool-${facet.key}`;
          const checked = (query.facets[facet.key] ?? []).includes("1");
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
                  toggleFacet(facet.key, "1", value === true)
                }
              />
              {facet.name}
            </label>
          );
        }

        return (
          <div key={facet.key} className="flex flex-col gap-3">
            <p className="text-sm font-medium">{facet.name}</p>
            {facet.options.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("filterEmpty")}</p>
            ) : (
              facet.options.map((option) => {
                const checked = (query.facets[facet.key] ?? []).includes(
                  option.slug
                );
                const id = `${idPrefix}-${facet.key}-${option.slug}`;
                return (
                  <label
                    key={option.slug}
                    htmlFor={id}
                    className="flex cursor-pointer items-center gap-3 text-sm"
                  >
                    <Checkbox
                      id={id}
                      checked={checked}
                      onCheckedChange={(value) =>
                        toggleFacet(facet.key, option.slug, value === true)
                      }
                    />
                    {option.label}
                  </label>
                );
              })
            )}
          </div>
        );
      })}
    </div>
  );
}

function nodeContainsSlug(node: PublicFilterNode, slug: string): boolean {
  if (node.slug === slug) return true;
  return node.children.some((child) => nodeContainsSlug(child, slug));
}

function CatalogFilterBranch({
  nodes,
  idPrefix,
  query,
  selectFolder,
  toggleFacet,
  setRange,
}: {
  nodes: PublicFilterNode[];
  idPrefix: string;
  query: ReturnType<typeof parseCatalogQuery>;
  selectFolder: (slug: string) => void;
  toggleFacet: (key: string, value: string, checked: boolean) => void;
  setRange: (key: string, range: CatalogRange) => void;
}) {
  const selected = query.folders[0];
  const openSlug = selected
    ? nodes.find((node) => nodeContainsSlug(node, selected))?.slug
    : undefined;

  if (nodes.length === 0) return null;

  return (
    <Accordion
      type="single"
      collapsible
      value={openSlug}
      onValueChange={(value) => {
        if (value) selectFolder(value);
      }}
      className="w-full"
    >
      {nodes.map((node) => {
        const isLeaf = node.children.length === 0;
        return (
          <AccordionItem
            key={node.id}
            value={node.slug}
            className="border-b border-border"
          >
            <AccordionTrigger className="py-3 text-sm font-medium hover:no-underline">
              {node.name}
            </AccordionTrigger>
            <AccordionContent className="pb-3">
              {isLeaf ? (
                <FacetFields
                  facets={node.facets}
                  idPrefix={`${idPrefix}-${node.slug}`}
                  query={query}
                  toggleFacet={toggleFacet}
                  setRange={setRange}
                />
              ) : (
                <CatalogFilterBranch
                  nodes={node.children}
                  idPrefix={`${idPrefix}-${node.slug}`}
                  query={query}
                  selectFolder={selectFolder}
                  toggleFacet={toggleFacet}
                  setRange={setRange}
                />
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

export function CatalogFilterFields({
  schema,
  idPrefix,
  className,
}: {
  schema: PublicFilterSchema;
  idPrefix: string;
  className?: string;
}) {
  const {
    t,
    query,
    activeCount,
    selectFolder,
    toggleFacet,
    setRange,
    clearFilters,
  } = useCatalogFilters(schema);

  const empty = schema.tree.length === 0;

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {empty ? (
        <p className="text-sm text-muted-foreground">{t("filterEmptyFacets")}</p>
      ) : (
        <CatalogFilterBranch
          nodes={schema.tree}
          idPrefix={idPrefix}
          query={query}
          selectFolder={selectFolder}
          toggleFacet={toggleFacet}
          setRange={setRange}
        />
      )}

      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={activeCount === 0}
        onClick={clearFilters}
      >
        {t("filterClear")}
      </Button>
    </div>
  );
}
