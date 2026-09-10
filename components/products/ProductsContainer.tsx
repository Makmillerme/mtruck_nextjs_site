import ProductsGrid from "./ProductsGrid";
import ProductsList from "./ProductsList";
import CatalogView from "./catalog-view";
import {
  fetchAllProducts,
  fetchProductBrands,
  fetchUserFavoriteIds,
} from "@/utils/actions";
import { getTranslations } from "next-intl/server";
import type { CatalogLayout } from "@/utils/catalog-layout";
import type { CatalogSort } from "@/utils/catalog-query";

async function CatalogResults({
  layout,
  search,
  sort,
  brands,
  featuredOnly,
}: {
  layout: CatalogLayout;
  search: string;
  sort: CatalogSort;
  brands: string[];
  featuredOnly: boolean;
}) {
  const t = await getTranslations("Products");
  const [products, favorites] = await Promise.all([
    fetchAllProducts({ search, sort, brands, featuredOnly }),
    fetchUserFavoriteIds(),
  ]);
  const totalProducts = products.length;
  const emptyLabel =
    totalProducts === 0
      ? search || brands.length || featuredOnly
        ? t("emptySearch")
        : t("empty")
      : null;

  return (
    <>
      <h4 className="mb-3 text-lg font-medium">
        {t("count", { count: totalProducts })}
      </h4>
      {emptyLabel ? (
        <h5 className="mt-16 text-2xl">{emptyLabel}</h5>
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
    </>
  );
}

async function ProductsContainer({
  layout,
  search,
  sort,
  brands,
  featuredOnly,
}: {
  layout: CatalogLayout;
  search: string;
  sort: CatalogSort;
  brands: string[];
  featuredOnly: boolean;
}) {
  const brandOptions = await fetchProductBrands();

  return (
    <CatalogView
      initialLayout={layout}
      initialSearch={search}
      initialSort={sort}
      brands={brandOptions}
    >
      <CatalogResults
        layout={layout}
        search={search}
        sort={sort}
        brands={brands}
        featuredOnly={featuredOnly}
      />
    </CatalogView>
  );
}
export default ProductsContainer;
