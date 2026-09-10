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
      ? "border-primary bg-primary text-primary-foreground"
      : "border-border bg-secondary text-muted-foreground hover:border-primary/30 hover:text-foreground"
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

  const brandLabel = selectedBrand
    ? (FINDER_BRANDS.find((brand) => brand.id === selectedBrand)?.label ??
      t("allBrands"))
    : t("allBrands");

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
                "relative flex min-w-[8.5rem] shrink-0 flex-col items-start gap-2.5 rounded-sm border bg-background px-3 py-3 text-left shadow-sm transition-colors sm:min-w-[9.5rem] sm:gap-3 sm:px-4 sm:py-4 md:min-w-0",
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

      <div className="mt-8 rounded-sm border border-border bg-background p-5 shadow-sm md:mt-10 md:p-8">
        <header className="mb-6 md:mb-8">
          <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {t("filterEyebrow")}
          </p>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            {t("filterLead")}
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="min-w-0 lg:col-span-7">
            <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
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

          <div className="min-w-0 lg:col-span-5">
            <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {t("statusLabel")}
            </p>
            <div className="flex flex-col gap-2">
              {FINDER_STATUS.map((status) => {
                const active = statusFilter === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={cn(
                      "flex w-full flex-col items-start gap-0.5 rounded-sm border px-4 py-3 text-left transition-colors",
                      active
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-secondary text-foreground hover:border-foreground/30"
                    )}
                  >
                    <span className="text-sm font-semibold">
                      {t(`status.${status}`)}
                    </span>
                    <span
                      className={cn(
                        "text-xs leading-snug",
                        active ? "text-background/70" : "text-muted-foreground"
                      )}
                    >
                      {t(`statusHint.${status}`)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between md:mt-10">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("summary", {
              category: t(`categories.${selectedCategory}`),
              brand: brandLabel,
              status: t(`status.${statusFilter}`),
            })}
          </p>
          <Button asChild size="lg" className="w-full shrink-0 sm:w-auto">
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
