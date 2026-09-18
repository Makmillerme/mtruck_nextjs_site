"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  CATALOG_PAGE_SIZES,
  type CatalogPageSize,
} from "@/utils/catalog-query";
import { useTranslations } from "next-intl";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

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
        <Select
          value={String(pageSize)}
          onValueChange={(value) =>
            onPageSizeChange(Number(value) as CatalogPageSize)
          }
        >
          <SelectTrigger className="h-9 w-[4.5rem] rounded-sm">
            <SelectValue placeholder={String(pageSize)} />
          </SelectTrigger>
          <SelectContent>
            {CATALOG_PAGE_SIZES.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
