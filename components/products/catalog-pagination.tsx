"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEdgeMenuAlign } from "@/lib/use-edge-menu-align";
import { cn } from "@/lib/utils";
import {
  CATALOG_PAGE_SIZES_NARROW,
  CATALOG_WIDE_PAGE_SIZE_MQ,
  catalogPageSizesForViewport,
  nearestCatalogPageSize,
  type CatalogPageSize,
} from "@/utils/catalog-query";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { LuChevronDown, LuChevronLeft, LuChevronRight } from "react-icons/lu";

function useCatalogPageSizeOptions() {
  const [wide3Col, setWide3Col] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(CATALOG_WIDE_PAGE_SIZE_MQ);
    const sync = () => setWide3Col(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return catalogPageSizesForViewport(wide3Col);
}

export default function CatalogPagination({
  page,
  pageCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
  className,
}: {
  page: number;
  pageCount: number;
  pageSize: CatalogPageSize;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: CatalogPageSize) => void;
  className?: string;
}) {
  const t = useTranslations("Products");
  const safeCount = Math.max(1, pageCount);
  const safePage = Math.min(Math.max(1, page), safeCount);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { align, onOpenChange, collisionPadding } = useEdgeMenuAlign("end");
  const pageSizeOptions = useCatalogPageSizeOptions();
  const onPageSizeChangeRef = useRef(onPageSizeChange);
  onPageSizeChangeRef.current = onPageSizeChange;

  useEffect(() => {
    if ((pageSizeOptions as readonly number[]).includes(pageSize)) return;
    onPageSizeChangeRef.current(
      nearestCatalogPageSize(pageSize, pageSizeOptions)
    );
  }, [pageSize, pageSizeOptions]);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-9"
          disabled={safePage <= 1}
          aria-label={t("prevPage")}
          onClick={() => onPageChange(safePage - 1)}
        >
          <LuChevronLeft className="size-4" />
        </Button>
        <p className="min-w-[4.5rem] text-center text-sm tabular-nums text-muted-foreground">
          {t("pageOf", { page: safePage, total: safeCount })}
        </p>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-9"
          disabled={safePage >= safeCount}
          aria-label={t("nextPage")}
          onClick={() => onPageChange(safePage + 1)}
        >
          <LuChevronRight className="size-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{t("pageSize")}</span>
        <DropdownMenu
          modal={false}
          onOpenChange={(open) => onOpenChange(open, triggerRef.current)}
        >
          <DropdownMenuTrigger asChild>
            <Button
              ref={triggerRef}
              type="button"
              variant="outline"
              size="sm"
              className="h-9 min-w-[4.5rem] gap-1.5"
              aria-label={t("pageSize")}
            >
              {pageSize}
              <LuChevronDown className="size-4 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align={align}
            collisionPadding={collisionPadding}
            className="min-w-0 w-max"
          >
            <DropdownMenuRadioGroup
              value={String(
                (pageSizeOptions as readonly number[]).includes(pageSize)
                  ? pageSize
                  : nearestCatalogPageSize(pageSize, pageSizeOptions)
              )}
              onValueChange={(value) =>
                onPageSizeChange(Number(value) as CatalogPageSize)
              }
            >
              {(pageSizeOptions.length > 0
                ? pageSizeOptions
                : CATALOG_PAGE_SIZES_NARROW
              ).map((size) => (
                <DropdownMenuRadioItem key={size} value={String(size)}>
                  {size}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
