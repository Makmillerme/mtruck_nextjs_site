"use client";

import CatalogPagination from "@/components/products/catalog-pagination";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import type { CatalogPageSize } from "@/utils/catalog-query";

const DEMO_TREE = [
  {
    slug: "commercial",
    name: "Комерційна техніка",
    children: [
      {
        slug: "trucks",
        name: "Вантажні авто",
        children: [
          {
            slug: "containers",
            name: "Контейнеровози",
            children: [] as { slug: string; name: string; children: never[]; facets: string[] }[],
            facets: ["Марка", "Рік", "Пробіг"],
          },
        ],
        facets: [] as string[],
      },
      {
        slug: "trailers",
        name: "Причепи",
        children: [],
        facets: ["Тип", "Вантажопідйомність"],
      },
    ],
    facets: [] as string[],
  },
] as const;

type DemoNode = {
  slug: string;
  name: string;
  children: DemoNode[];
  facets: string[];
};

function DemoBranch({
  nodes,
  selected,
  onSelect,
}: {
  nodes: DemoNode[];
  selected: string | null;
  onSelect: (slug: string) => void;
}) {
  const openSlug = selected
    ? nodes.find(
        (node) =>
          node.slug === selected ||
          node.children.some(
            (child) =>
              child.slug === selected ||
              child.children.some((g) => g.slug === selected)
          )
      )?.slug
    : undefined;

  return (
    <Accordion
      type="single"
      collapsible
      value={openSlug}
      onValueChange={(value) => {
        if (value) onSelect(value);
      }}
      className="w-full border-t border-border"
    >
      {nodes.map((node) => {
        const isLeaf = node.children.length === 0;
        return (
          <AccordionItem key={node.slug} value={node.slug} className="border-b border-border">
            <AccordionTrigger className="py-3 text-sm font-medium hover:no-underline">
              {node.name}
            </AccordionTrigger>
            <AccordionContent className="pb-3">
              {isLeaf ? (
                <div className="flex flex-col gap-2">
                  {node.facets.map((facet) => (
                    <label
                      key={facet}
                      className="flex cursor-pointer items-center gap-3 text-sm"
                    >
                      <Checkbox />
                      {facet}
                    </label>
                  ))}
                </div>
              ) : (
                <DemoBranch
                  nodes={node.children}
                  selected={selected}
                  onSelect={onSelect}
                />
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

export function UiLabCatalogFilterDemo() {
  const [selected, setSelected] = useState<string | null>("containers");

  return (
    <div className="grid max-w-md gap-3">
      <p className="text-sm text-muted-foreground">
        Вкладений Accordion <code className="text-xs">type=single</code>: сусід
        того ж рівня закриває попередній; поля лише в листку.
      </p>
      <DemoBranch
        nodes={DEMO_TREE as unknown as DemoNode[]}
        selected={selected}
        onSelect={setSelected}
      />
      <p className="text-xs text-muted-foreground">
        Обрано:{" "}
        <span className="font-medium text-foreground">{selected ?? "—"}</span>
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
        Стрілки + <code className="text-xs">сторінка / усього</code> + Select
        10/25/40. Той самий блок на <code className="text-xs">/products</code>.
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
