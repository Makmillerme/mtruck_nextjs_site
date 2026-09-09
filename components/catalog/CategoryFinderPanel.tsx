"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
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
  const ready = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
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
      <div className="mb-8 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          {t("eyebrow")}
        </p>
        <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {t("title")}
        </h2>
      </div>

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
                "relative flex min-w-[8.5rem] shrink-0 flex-col items-start gap-2.5 rounded-xl border bg-background px-3 py-3 text-left shadow-sm transition-colors sm:min-w-[9.5rem] sm:gap-3 sm:px-4 sm:py-4 md:min-w-0",
                active
                  ? "border-primary/40 text-foreground ring-1 ring-primary/20"
                  : "border-border/80 text-muted-foreground hover:border-primary/30 hover:text-foreground"
              )}
            >
              {ready && active ? (
                <motion.span
                  layoutId="activeCategoryHighlight"
                  className="pointer-events-none absolute inset-0 rounded-xl border border-primary/50 bg-primary/5"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              ) : null}
              <Icon
                className={cn(
                  "relative size-5 shrink-0",
                  active ? "text-primary" : "text-muted-foreground"
                )}
                aria-hidden
              />
              <span className="relative text-sm font-medium leading-snug text-foreground">
                {t(`categories.${category.id}`)}
              </span>
              <span
                className={cn(
                  "relative rounded-md px-2 py-0.5 text-xs font-medium tabular-nums",
                  active
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {category.baseCount}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-background p-4 shadow-sm md:mt-8 md:p-6">
        <div className="flex min-w-0 flex-col gap-5 overflow-hidden lg:flex-row lg:items-end lg:justify-between lg:gap-8">
          <div className="flex min-w-0 flex-1 flex-col gap-5">
            <div className="min-w-0 overflow-hidden">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
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
                <motion.div
                  key={selectedCategory}
                  className="flex min-w-0 flex-nowrap items-center justify-start gap-2 md:flex-wrap"
                  initial={ready ? "hidden" : false}
                  animate="show"
                  variants={{
                    hidden: {},
                    show: {
                      transition: { staggerChildren: 0.07, delayChildren: 0.04 },
                    },
                  }}
                >
                  {FINDER_BRANDS.map((brand) => (
                    <motion.button
                      key={brand.id}
                      type="button"
                      variants={{
                        hidden: { opacity: 0 },
                        show: { opacity: 1 },
                      }}
                      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                      onClick={() =>
                        setSelectedBrand((prev) =>
                          prev === brand.id ? null : brand.id
                        )
                      }
                      className={chipClass(selectedBrand === brand.id)}
                    >
                      {brand.label}
                    </motion.button>
                  ))}
                </motion.div>
              </div>
            </div>

            <div className="min-w-0">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
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

          <Link
            href={href}
            className="inline-flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 lg:w-auto"
          >
            {t("cta", { count })}
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
