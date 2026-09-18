import ProductsGrid from "./ProductsGrid";
import ProductsList from "./ProductsList";
import CatalogView from "./catalog-view";
import CatalogPaginationClient from "./catalog-pagination-client";
import { fetchPublicFilterSchema } from "@/lib/catalog/public-filter";
import { fetchAllProducts, fetchUserFavoriteIds } from "@/utils/actions";
import { getTranslations } from "next-intl/server";
import type { CatalogLayout } from "@/utils/catalog-layout";
import type { CatalogQuery } from "@/utils/catalog-query";

async function CatalogResults({
  layout,
  query,
}: {
  layout: CatalogLayout;
  query: Omit<CatalogQuery, "layout">;
}) {
  const t = await getTranslations("Products");
  const [{ products, total }, favorites] = await Promise.all([
    fetchAllProducts({
      search: query.search,
      sort: query.sort,
      featuredOnly: query.featuredOnly,
      folders: query.folders,
      facets: query.facets,
      ranges: query.ranges,
      page: query.page,
      pageSize: query.pageSize,
    }),
    fetchUserFavoriteIds(),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / query.pageSize));
  const emptyLabel =
    total === 0
      ? query.search ||
        query.folders.length ||
        query.featuredOnly ||
        Object.keys(query.facets).length ||
        Object.keys(query.ranges).length
        ? t("emptySearch")
        : t("empty")
      : null;

  return (
    <>
      <h2 className="mb-3 text-lg font-medium">
        {t("count", { count: total })}
      </h2>
      {emptyLabel ? (
        <p className="mt-16 text-2xl">{emptyLabel}</p>
      ) : layout === "grid" ? (
        <ProductsGrid
          products={products}
          favoriteByProductId={favorites.favoriteByProductId}
          isAuthenticated={favorites.isAuthenticated}
          priorityCount={3}
        />
      ) : (
        <ProductsList
          products={products}
          favoriteByProductId={favorites.favoriteByProductId}
          isAuthenticated={favorites.isAuthenticated}
          priorityCount={3}
        />
      )}
      {total > 0 ? (
        <CatalogPaginationClient
          page={query.page}
          pageCount={pageCount}
          pageSize={query.pageSize}
          className="mt-8"
        />
      ) : null}
    </>
  );
}

async function ProductsContainer({
  layout,
  query,
}: {
  layout: CatalogLayout;
  query: Omit<CatalogQuery, "layout">;
}) {
  const t = await getTranslations("Products");
  const schema = await fetchPublicFilterSchema();

  return (
    <div className="page-content">
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight md:text-4xl">
        {t("pageTitle")}
      </h1>
      <CatalogView
        initialLayout={layout}
        initialSearch={query.search}
        initialSort={query.sort}
        schema={schema}
      >
        <CatalogResults layout={layout} query={query} />
      </CatalogView>
    </div>
  );
}
export default ProductsContainer;
