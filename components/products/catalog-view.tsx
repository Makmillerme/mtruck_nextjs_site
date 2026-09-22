"use client";

import {
  CatalogFilterClearButton,
  CatalogFilterFields,
  CatalogFilterProvider,
} from "@/components/products/catalog-filters";
import {
  countActiveCatalogFilters,
  parseCatalogQuery,
} from "@/utils/catalog-query";
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
import type { FilterAvailabilityIndex } from "@/lib/catalog/filter-availability";
import type { PublicFilterSchema } from "@/lib/catalog/public-filter";
import { useEdgeMenuAlign } from "@/lib/use-edge-menu-align";
import { cn } from "@/lib/utils";

import {
  CATALOG_LAYOUT_COOKIE,
  parseCatalogLayout,
  type CatalogLayout,
} from "@/utils/catalog-layout";
import {
  buildCatalogHref,
  parseCatalogSort,
  type CatalogSort,
} from "@/utils/catalog-query";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import {
  createContext,
  useContext,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import {
  LuArrowUpDown,
  LuLayoutGrid,
  LuList,
  LuListFilter,
  LuSearch,
} from "react-icons/lu";
import { useDebouncedCallback } from "use-debounce";

function persistLayoutCookie(layout: CatalogLayout) {
  document.cookie = `${CATALOG_LAYOUT_COOKIE}=${layout}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

const CatalogLayoutContext = createContext<CatalogLayout>("grid");

/** Client layout for grid/list — no URL navigation (keeps filter open/draft). */
export function useCatalogLayout() {
  return useContext(CatalogLayoutContext);
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
  const [search, setSearch] = useState(urlSearch);
  const [prevUrlSearch, setPrevUrlSearch] = useState(urlSearch);

  // Sync from URL when it changes externally (filters/back), without useEffect.
  if (urlSearch !== prevUrlSearch) {
    setPrevUrlSearch(urlSearch);
    setSearch(urlSearch);
  }

  const [, startTransition] = useTransition();
  const handleSearch = useDebouncedCallback((value: string) => {
    const href = buildCatalogHref(new URLSearchParams(window.location.search), {
      search: value,
    });
    startTransition(() => {
      router.replace(href, { scroll: false });
    });
  }, 400);

  return (
    <div className="relative min-w-0 flex-1">
      <LuSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={search}
        placeholder={t("searchPlaceholder")}
        className="h-9 pl-9"
        onChange={(event) => {
          setSearch(event.target.value);
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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { align, onOpenChange, collisionPadding } = useEdgeMenuAlign("end");

  const [, startTransition] = useTransition();
  function selectSort(next: string) {
    const href = buildCatalogHref(new URLSearchParams(window.location.search), {
      sort: parseCatalogSort(next),
    });
    startTransition(() => {
      router.replace(href, { scroll: false });
    });
  }

  return (
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
          className="h-9 shrink-0 gap-2"
          aria-label={t("sort")}
        >
          <LuArrowUpDown className="size-4" />
          <span className="hidden sm:inline">{t("sort")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        collisionPadding={collisionPadding}
        className="min-w-0 w-max"
      >
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
  schema,
  availability,
}: {
  schema: PublicFilterSchema;
  availability: FilterAvailabilityIndex;
}) {
  const t = useTranslations("Products");
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const activeCount = countActiveCatalogFilters(
    parseCatalogQuery(searchParams)
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
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
            <Badge className="h-5 min-w-5 border-0 bg-primary-foreground px-1.5 text-primary hover:bg-primary-foreground">
              {activeCount}
            </Badge>
          ) : null}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col gap-0 overflow-hidden p-0">
        <CatalogFilterProvider
          schema={schema}
          availability={availability}
          onApplied={() => setOpen(false)}
        >
          <SheetHeader className="flex shrink-0 flex-row items-center justify-between space-y-0 px-6 pt-6 pr-14">
            <SheetTitle>{t("filter")}</SheetTitle>
            <CatalogFilterClearButton />
          </SheetHeader>
          <div className="flex min-h-0 flex-1 flex-col px-6 pb-6 pt-4">
            <CatalogFilterFields idPrefix="catalog-mobile" />
          </div>
        </CatalogFilterProvider>
      </SheetContent>
    </Sheet>
  );
}

function CatalogFilterSidebar({
  schema,
  availability,
}: {
  schema: PublicFilterSchema;
  availability: FilterAvailabilityIndex;
}) {
  const t = useTranslations("Products");

  return (
    <aside className="hidden min-w-0 lg:block">
      {/* Aside stretches with the main column so sticky has a tall track;
          Card height follows content, capped by max-h. */}
      <Card className="sticky top-16 flex w-full max-h-[calc(100vh-5rem)] flex-col border-border/60 shadow-none lg:top-[4.5rem] lg:max-h-[calc(100vh-6rem)]">
        <CatalogFilterProvider schema={schema} availability={availability}>
          <CardHeader className="flex shrink-0 flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-semibold tracking-tight">
              {t("filter")}
            </CardTitle>
            <CatalogFilterClearButton />
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden pt-0">
            <CatalogFilterFields idPrefix="catalog-desktop" />
          </CardContent>
        </CatalogFilterProvider>
      </Card>
    </aside>
  );
}

export default function CatalogView({
  initialLayout,
  initialSearch,
  initialSort,
  schema,
  availability,
  children,
}: {
  initialLayout: CatalogLayout;
  initialSearch: string;
  initialSort: CatalogSort;
  schema: PublicFilterSchema;
  availability: FilterAvailabilityIndex;
  children: ReactNode;
}) {
  const t = useTranslations("Products");
  const [layout, setLayout] = useState(parseCatalogLayout(initialLayout));
  const [prevLayout, setPrevLayout] = useState(initialLayout);

  if (initialLayout !== prevLayout) {
    setPrevLayout(initialLayout);
    setLayout(parseCatalogLayout(initialLayout));
  }

  function selectLayout(next: CatalogLayout) {
    if (next === layout) return;
    setLayout(next);
    persistLayoutCookie(next);
  }

  return (
    <CatalogLayoutContext.Provider value={layout}>
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)] lg:gap-8">
        <CatalogFilterSidebar schema={schema} availability={availability} />
        <div className="flex min-w-0 flex-col">
          <section className="flex flex-col gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <CatalogSearch initialSearch={initialSearch} />
              <CatalogSortButton initialSort={initialSort} />
              <div className="hidden shrink-0 items-center gap-1 md:flex">
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
              <CatalogFilterSheet schema={schema} availability={availability} />
            </div>
          </section>
          <div className="mt-6 flex min-h-0 flex-1 flex-col">{children}</div>
        </div>
      </div>
    </CatalogLayoutContext.Provider>
  );
}
