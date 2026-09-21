"use client";

import { useCatalogLayout } from "@/components/products/catalog-view";
import type { ReactNode } from "react";

/** Switches grid/list from CatalogView context — no navigation. */
export default function CatalogResultsSwitch({
  countLabel,
  emptyLabel,
  grid,
  list,
  pagination,
}: {
  countLabel: string;
  emptyLabel: string | null;
  grid: ReactNode;
  list: ReactNode;
  pagination: ReactNode;
}) {
  const layout = useCatalogLayout();

  return (
    <>
      <h2 className="mb-3 text-lg font-medium">{countLabel}</h2>
      {emptyLabel ? (
        <p className="mt-16 text-2xl">{emptyLabel}</p>
      ) : layout === "grid" ? (
        grid
      ) : (
        list
      )}
      {pagination}
    </>
  );
}
