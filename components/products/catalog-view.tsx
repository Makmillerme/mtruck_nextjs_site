"use client";

import { CatalogFilterFields, useCatalogFilters } from "@/components/products/catalog-filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useRouter } from "@/i18n/navigation";
import {
  CATALOG_LAYOUT_COOKIE,
  parseCatalogLayout,
  type CatalogLayout,
} from "@/utils/catalog-layout";
import { parseCatalogSort, type CatalogSort } from "@/utils/catalog-query";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { type ReactNode } from "react";
import {
  LuArrowUpDown,
  LuLayoutGrid,
  LuList,
  LuListFilter,
  LuSearch,
} from "react-icons/lu";
import { useDebouncedCallback } from "use-debounce";

function persistLayout(layout: CatalogLayout) {
  document.cookie = `${CATALOG_LAYOUT_COOKIE}=${layout}; Path=/; Max-Age=31536000; SameSite=Lax`;
  const params = new URLSearchParams(window.location.search);
  params.set("layout", layout);
  const query = params.toString();
  const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
  window.history.replaceState(window.history.state, "", nextUrl);
}

function CatalogSearch({
  initialSearch,
}: {
  initialSearch: string;
}) {
  const t = useTranslations("Products");
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") ?? initialSearch;

  const handleSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(window.location.search);
    if (value) params.set("search", value);
    else params.delete("search");
    const query = params.toString();
    router.replace(query ? `/products?${query}` : "/products", { scroll: false });
  }, 400);

  return (
    <div className="relative min-w-0 flex-1">
      <LuSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        key={urlSearch}
        type="search"
        defaultValue={urlSearch}
        placeholder={t("searchPlaceholder")}
        className="h-9 pl-9"
        onChange={(event) => {
          handleSearch(event.target.value);
        }}
        aria-label={t("searchPlaceholder")}
      />
    </div>
  );
}

function CatalogSortButton({
  initialSort,
}: {
  initialSort: CatalogSort;
}) {
  const t = useTranslations("Products");
  const router = useRouter();
  const searchParams = useSearchParams();
  const sort = parseCatalogSort(searchParams.get("sort") ?? initialSort);

  function selectSort(next: string) {
    const params = new URLSearchParams(window.location.search);
    if (next && next !== "newest") params.set("sort", next);
    else params.delete("sort");
    const query = params.toString();
    router.replace(query ? `/products?${query}` : "/products", { scroll: false });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="h-9 shrink-0 gap-2" aria-label={t("sort")}>
          <LuArrowUpDown className="size-4" />
          <span className="hidden sm:inline">{t("sort")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuRadioGroup value={sort} onValueChange={selectSort}>
          <DropdownMenuRadioItem value="newest">{t("sortNewest")}</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="price-asc">{t("sortPriceAsc")}</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="price-desc">{t("sortPriceDesc")}</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="name">{t("sortName")}</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CatalogFilterSheet({
  brands,
}: {
  brands: string[];
}) {
  const t = useTranslations("Products");
  const { activeCount } = useCatalogFilters(brands);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="default"
          size="sm"
          className="relative h-9 shrink-0 gap-2 lg:hidden"
          aria-label={t("filter")}
        >
          <LuListFilter className="size-4" />
          <span className="hidden sm:inline">{t("filter")}</span>
          {activeCount > 0 ? (
            <Badge className="h-5 min-w-5 px-1.5" variant="default">
              {activeCount}
            </Badge>
          ) : null}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex w-80 flex-col gap-6 sm:max-w-80">
        <SheetHeader className="text-left">
          <SheetTitle>{t("filter")}</SheetTitle>
        </SheetHeader>
        <CatalogFilterFields brands={brands} idPrefix="catalog-mobile" />
      </SheetContent>
    </Sheet>
  );
}

function CatalogFilterSidebar({
  brands,
}: {
  brands: string[];
}) {
  const t = useTranslations("Products");

  return (
    <aside className="hidden min-w-0 lg:block">
      <Card className="sticky top-16 max-h-[calc(100vh-5rem)] lg:top-[4.5rem] lg:max-h-[calc(100vh-6rem)] overflow-y-auto shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">{t("filter")}</CardTitle>
        </CardHeader>
        <CardContent>
          <CatalogFilterFields brands={brands} idPrefix="catalog-desktop" />
        </CardContent>
      </Card>
    </aside>
  );
}

export default function CatalogView({
  initialLayout,
  initialSearch,
  initialSort,
  brands,
  children,
}: {
  initialLayout: CatalogLayout;
  initialSearch: string;
  initialSort: CatalogSort;
  brands: string[];
  children: ReactNode;
}) {
  const t = useTranslations("Products");
  const router = useRouter();
  const layout = parseCatalogLayout(initialLayout);

  function selectLayout(next: CatalogLayout) {
    persistLayout(next);
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[18rem_minmax(0,1fr)]">
      <CatalogFilterSidebar brands={brands} />
      <div className="min-w-0">
        <section className="flex flex-col gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <CatalogSearch initialSearch={initialSearch} />
            <CatalogSortButton initialSort={initialSort} />
            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                variant={layout === "grid" ? "default" : "ghost"}
                size="icon"
                className="size-9"
                aria-pressed={layout === "grid"}
                aria-label={t("layoutGrid")}
                onClick={() => selectLayout("grid")}
              >
                <LuLayoutGrid />
              </Button>
              <Button
                type="button"
                variant={layout === "list" ? "default" : "ghost"}
                size="icon"
                className="size-9"
                aria-pressed={layout === "list"}
                aria-label={t("layoutList")}
                onClick={() => selectLayout("list")}
              >
                <LuList />
              </Button>
            </div>
            <CatalogFilterSheet brands={brands} />
          </div>
        </section>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
