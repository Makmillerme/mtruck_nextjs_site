import { Suspense } from "react";
import {
  LoadingCatalogGridCards,
  LoadingCatalogPage,
} from "@/components/global/loading-skeletons";
import ProductsGrid from "./ProductsGrid";
import ProductsList from "./ProductsList";
import CatalogView from "./catalog-view";
import CatalogPaginationClient from "./catalog-pagination-client";
import CatalogResultsSwitch from "./catalog-results-switch";
import { CatalogSoftNavResults } from "./catalog-soft-nav";
import { fetchFilterAvailabilityIndex } from "@/lib/catalog/filter-availability";
import { narrowDraftAgainstIndex } from "@/lib/catalog/narrow-facets";
import {
  fetchPublicFilterSchema,
  pruneScopedFacetsForTree,
  pruneScopedFacetsToSchema,
} from "@/lib/catalog/public-filter";
import { fetchAllProducts, fetchUserFavoriteIds } from "@/utils/actions";
import { getTranslations } from "next-intl/server";
import type { CatalogLayout } from "@/utils/catalog-layout";
import {
  catalogQueryIsFiltered,
  type CatalogQuery,
} from "@/utils/catalog-query";

async function CatalogResults({
  query,
}: {
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
      scopedFacets: query.scopedFacets,
      scopedRanges: query.scopedRanges,
      page: query.page,
      pageSize: query.pageSize,
    }),
    fetchUserFavoriteIds(),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / query.pageSize));
  const emptyLabel =
    total === 0
      ? catalogQueryIsFiltered(query)
        ? t("emptySearch")
        : t("empty")
      : null;

  return (
    <CatalogResultsSwitch
      countLabel={t("count", { count: total })}
      emptyLabel={emptyLabel}
      grid={
        <ProductsGrid
          products={products}
          favoriteByProductId={favorites.favoriteByProductId}
          isAuthenticated={favorites.isAuthenticated}
          priorityCount={3}
        />
      }
      list={
        <ProductsList
          products={products}
          favoriteByProductId={favorites.favoriteByProductId}
          isAuthenticated={favorites.isAuthenticated}
          priorityCount={3}
        />
      }
      pagination={
        total > 0 ? (
          <CatalogPaginationClient
            page={query.page}
            pageCount={pageCount}
            pageSize={query.pageSize}
            className="mt-8"
          />
        ) : null
      }
    />
  );
}

async function ProductsCatalogBody({
  layout,
  query,
}: {
  layout: CatalogLayout;
  query: Omit<CatalogQuery, "layout">;
}) {
  const [schema, availability] = await Promise.all([
    fetchPublicFilterSchema(),
    fetchFilterAvailabilityIndex(),
  ]);
  const dependentPruned = {
    ...query,
    scopedFacets: pruneScopedFacetsForTree(schema.tree, query.scopedFacets),
  };
  const availabilityPruned = narrowDraftAgainstIndex(
    schema.tree,
    dependentPruned.folders,
    dependentPruned.scopedFacets,
    dependentPruned.scopedRanges,
    availability
  );
  const prunedQuery = {
    ...dependentPruned,
    scopedFacets: pruneScopedFacetsToSchema(
      schema.tree,
      availabilityPruned.scopedFacets
    ),
    scopedRanges: availabilityPruned.scopedRanges,
  };

  return (
    <CatalogView
      initialLayout={layout}
      initialSearch={prunedQuery.search}
      initialSort={prunedQuery.sort}
      schema={schema}
      availability={availability}
    >
      <CatalogSoftNavResults>
        {/* Soft-nav: startTransition keeps prior results (no fallback flash).
            Cold stream: skeleton only while results have never painted. */}
        <Suspense fallback={<LoadingCatalogGridCards count={6} />}>
          <CatalogResults query={prunedQuery} />
        </Suspense>
      </CatalogSoftNavResults>
    </CatalogView>
  );
}

function ProductsContainer({
  layout,
  query,
}: {
  layout: CatalogLayout;
  query: Omit<CatalogQuery, "layout">;
}) {
  return (
    <div className="page-content">
      {/* Nested Suspense (not route loading.tsx) so soft-nav transitions
          keep previous UI instead of flashing a full-page skeleton. */}
      <Suspense fallback={<LoadingCatalogPage />}>
        <ProductsCatalogBody layout={layout} query={query} />
      </Suspense>
    </div>
  );
}
export default ProductsContainer;
