"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  FINDER_BRANDS,
  FINDER_CATEGORIES,
  buildProductsHref,
  getMockOfferCount,
  type CategoryId,
} from "@/lib/home/category-finder";
import { LuChevronRight } from "react-icons/lu";

const YEAR_MIN = 1990;
const YEAR_MAX = new Date().getFullYear();

const chipClass = (active: boolean) =>
  cn(
    "shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors",
    active
      ? "border-primary bg-primary text-primary-foreground"
      : "border-border bg-secondary text-muted-foreground hover:border-primary/30 hover:text-foreground"
  );

const chipRowClass =
  "flex flex-nowrap items-center justify-start gap-2 overflow-x-auto overflow-y-hidden py-0.5 [-ms-overflow-style:none] [scrollbar-width:none] md:flex-wrap md:overflow-hidden [&::-webkit-scrollbar]:hidden";

const fieldLabelClass =
  "mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground";

function parsePositiveInt(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) return undefined;
  return Math.round(parsed);
}

function RangeInputs({
  label,
  from,
  to,
  onFrom,
  onTo,
  fromPlaceholder,
  toPlaceholder,
  min,
  max,
  inputMode,
}: {
  label: string;
  from: string;
  to: string;
  onFrom: (value: string) => void;
  onTo: (value: string) => void;
  fromPlaceholder: string;
  toPlaceholder: string;
  min?: number;
  max?: number;
  inputMode?: "numeric" | "decimal" | "text";
}) {
  return (
    <div className="min-w-0">
      <p className={fieldLabelClass}>{label}</p>
      <div className="grid grid-cols-2 gap-2">
        <Input
          type="number"
          inputMode={inputMode}
          min={min}
          max={max}
          value={from}
          onChange={(event) => onFrom(event.target.value)}
          placeholder={fromPlaceholder}
          aria-label={`${label} ${fromPlaceholder}`}
          className="bg-secondary"
        />
        <Input
          type="number"
          inputMode={inputMode}
          min={min}
          max={max}
          value={to}
          onChange={(event) => onTo(event.target.value)}
          placeholder={toPlaceholder}
          aria-label={`${label} ${toPlaceholder}`}
          className="bg-secondary"
        />
      </div>
    </div>
  );
}

/** Filter UI only — shell/background lives in CatalogBlock. */
export default function CategoryFinderPanel() {
  const t = useTranslations("CategoryFinder");
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryId>("tractors");
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [kmFrom, setKmFrom] = useState("");
  const [kmTo, setKmTo] = useState("");

  const ranges = useMemo(
    () => ({
      yearFrom: parsePositiveInt(yearFrom),
      yearTo: parsePositiveInt(yearTo),
      kmFrom: parsePositiveInt(kmFrom),
      kmTo: parsePositiveInt(kmTo),
    }),
    [yearFrom, yearTo, kmFrom, kmTo]
  );

  const count = useMemo(
    () => getMockOfferCount(selectedCategory, selectedBrand, "all"),
    [selectedCategory, selectedBrand]
  );

  const href = buildProductsHref(selectedCategory, selectedBrand, "all", ranges);

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

      <div className="mt-6 rounded-sm border border-border bg-background p-4 shadow-sm md:mt-8 md:p-5">
        <div className="flex flex-col gap-5">
          <div className="min-w-0">
            <p className={fieldLabelClass}>{t("brandsLabel")}</p>
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

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-4">
              <RangeInputs
                label={t("yearLabel")}
                from={yearFrom}
                to={yearTo}
                onFrom={setYearFrom}
                onTo={setYearTo}
                fromPlaceholder={t("rangeFrom")}
                toPlaceholder={t("rangeTo")}
                min={YEAR_MIN}
                max={YEAR_MAX}
                inputMode="numeric"
              />
            </div>
            <div className="lg:col-span-4">
              <RangeInputs
                label={t("mileageLabel")}
                from={kmFrom}
                to={kmTo}
                onFrom={setKmFrom}
                onTo={setKmTo}
                fromPlaceholder={t("rangeFrom")}
                toPlaceholder={t("rangeTo")}
                min={0}
                inputMode="numeric"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
              <Button asChild size="lg" className="w-full">
                <Link href={href}>
                  {t("cta", { count })}
                  <LuChevronRight aria-hidden />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
