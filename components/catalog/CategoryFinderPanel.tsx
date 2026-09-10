"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  FINDER_BRANDS,
  FINDER_CATEGORIES,
  FINDER_STATUS,
  buildProductsHref,
  getMockOfferCount,
  type CategoryId,
  type StatusFilter,
} from "@/lib/home/category-finder";
import { LuChevronRight } from "react-icons/lu";

const chipClass = (active: boolean) =>
  cn(
    "shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors",
    active
      ? "border-primary/40 bg-primary/10 text-primary"
      : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground"
  );

const chipRowClass =
  "flex flex-nowrap items-center justify-start gap-2 overflow-x-auto overflow-y-hidden py-0.5 [-ms-overflow-style:none] [scrollbar-width:none] md:flex-wrap md:overflow-hidden [&::-webkit-scrollbar]:hidden";

/** Filter UI only — shell/background lives in CatalogBlock. */
export default function CategoryFinderPanel() {
  const t = useTranslations("CategoryFinder");
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryId>("tractors");
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const count = useMemo(
    () => getMockOfferCount(selectedCategory, selectedBrand, statusFilter),
    [selectedCategory, selectedBrand, statusFilter]
  );

  const href = buildProductsHref(selectedCategory, selectedBrand, statusFilter);

  return (
    <div>
      <header className="mb-8 max-w-3xl lg:mb-10">
        <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
          {t("eyebrow")}
        </p>
        <h2 className="text-balance text-3xl font-black tracking-tight text-foreground md:text-4xl lg:text-[2.75rem] lg:leading-[1.12]">
          {t("title")}
        </h2>
      </header>

      <div
        className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 md:grid md:grid-cols-5 md:overflow-visible md:pb-0 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
      >
        {FINDER_CATEGORIES.map((category) => {
          const Icon = category.icon;
          const active = selectedCategory === category.id;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => {
                setSelectedCategory(category.id);
                setSelectedBrand(null);
              }}
              className={cn(
                "relative flex min-w-[8.5rem] shrink-0 flex-col items-start gap-2.5 rounded-sm border bg-background px-3 py-3 text-left transition-colors sm:min-w-[9.5rem] sm:gap-3 sm:px-4 sm:py-4 md:min-w-0",
                active
                  ? "border-foreground text-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "size-5 shrink-0",
                  active ? "text-foreground" : "text-muted-foreground"
                )}
                aria-hidden
              />
              <span className="text-sm font-medium leading-snug text-foreground">
                {t(`categories.${category.id}`)}
              </span>
              <span
                className={cn(
                  "font-mono text-[10px] tabular-nums tracking-wide",
                  active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {category.baseCount}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 border-t border-border pt-6 md:mt-10 md:pt-8">
        <div className="flex min-w-0 flex-col gap-5 overflow-hidden lg:flex-row lg:items-end lg:justify-between lg:gap-8">
          <div className="flex min-w-0 flex-1 flex-col gap-5">
            <div className="min-w-0 overflow-hidden">
              <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                {t("brandsLabel")}
              </p>
              <div className={chipRowClass}>
                <button
                  type="button"
                  onClick={() => setSelectedBrand(null)}
                  className={chipClass(selectedBrand === null)}
                >
                  {t("allBrands")}
                </button>
                <div className="flex min-w-0 flex-nowrap items-center justify-start gap-2 md:flex-wrap">
                  {FINDER_BRANDS.map((brand) => (
                    <button
                      key={brand.id}
                      type="button"
                      onClick={() =>
                        setSelectedBrand((prev) =>
                          prev === brand.id ? null : brand.id
                        )
                      }
                      className={chipClass(selectedBrand === brand.id)}
                    >
                      {brand.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="min-w-0">
              <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                {t("statusLabel")}
              </p>
              <div className={chipRowClass}>
                {FINDER_STATUS.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={chipClass(statusFilter === status)}
                  >
                    {t(`status.${status}`)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button asChild size="lg" className="w-full lg:w-auto">
            <Link href={href}>
              {t("cta", { count })}
              <LuChevronRight aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
