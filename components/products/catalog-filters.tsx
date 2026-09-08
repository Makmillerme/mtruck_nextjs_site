"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { parseCatalogBrands } from "@/utils/catalog-query";
import { cn } from "@/lib/utils";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

export function useCatalogFilters(brands: string[]) {
  const t = useTranslations("Products");
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedBrands = parseCatalogBrands(searchParams.get("brand"));
  const featured = searchParams.get("featured") === "1";
  const activeCount = selectedBrands.length + (featured ? 1 : 0);

  function updateFilters({
    nextBrands,
    nextFeatured,
  }: {
    nextBrands?: string[];
    nextFeatured?: boolean;
  }) {
    const params = new URLSearchParams(window.location.search);
    const brandsValue = nextBrands ?? selectedBrands;
    const featuredValue = nextFeatured ?? featured;

    if (brandsValue.length) params.set("brand", brandsValue.join(","));
    else params.delete("brand");

    if (featuredValue) params.set("featured", "1");
    else params.delete("featured");

    const query = params.toString();
    router.replace(query ? `/products?${query}` : "/products", { scroll: false });
  }

  function toggleBrand(brand: string, checked: boolean) {
    const next = checked
      ? [...selectedBrands, brand]
      : selectedBrands.filter((item) => item !== brand);
    updateFilters({ nextBrands: next });
  }

  function clearFilters() {
    updateFilters({ nextBrands: [], nextFeatured: false });
  }

  return {
    t,
    brands,
    selectedBrands,
    featured,
    activeCount,
    toggleBrand,
    updateFilters,
    clearFilters,
  };
}

export function CatalogFilterFields({
  brands,
  idPrefix,
  className,
}: {
  brands: string[];
  idPrefix: string;
  className?: string;
}) {
  const {
    t,
    selectedBrands,
    featured,
    activeCount,
    toggleBrand,
    updateFilters,
    clearFilters,
  } = useCatalogFilters(brands);

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium">{t("filterBrand")}</p>
        {brands.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("filterEmpty")}</p>
        ) : (
          brands.map((brand) => {
            const checked = selectedBrands.includes(brand);
            const id = `${idPrefix}-brand-${brand}`;
            return (
              <label
                key={brand}
                htmlFor={id}
                className="flex cursor-pointer items-center gap-3 text-sm"
              >
                <Checkbox
                  id={id}
                  checked={checked}
                  onCheckedChange={(value) => toggleBrand(brand, value === true)}
                />
                {brand}
              </label>
            );
          })
        )}
      </div>
      <label
        htmlFor={`${idPrefix}-featured`}
        className="flex cursor-pointer items-center gap-3 text-sm"
      >
        <Checkbox
          id={`${idPrefix}-featured`}
          checked={featured}
          onCheckedChange={(value) => updateFilters({ nextFeatured: value === true })}
        />
        {t("filterFeatured")}
      </label>
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
