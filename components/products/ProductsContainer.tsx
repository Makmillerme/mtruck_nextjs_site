import ProductsGrid from "./ProductsGrid";
import ProductsList from "./ProductsList";
import CatalogView from "./catalog-view";
import { fetchAllProducts, fetchProductBrands } from "@/utils/actions";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import type { CatalogLayout } from "@/utils/catalog-layout";
import type { CatalogSort } from "@/utils/catalog-query";

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
  const t = await getTranslations("Products");
  const [products, brandOptions] = await Promise.all([
    fetchAllProducts({ search, sort, brands, featuredOnly }),
    fetchProductBrands(),
  ]);
  const totalProducts = products.length;

  return (
    <Suspense>
      <CatalogView
        initialLayout={layout}
        initialSearch={search}
        initialSort={sort}
        brands={brandOptions}
        countLabel={t("count", { count: totalProducts })}
        emptyLabel={
          totalProducts === 0
            ? search || brands.length || featuredOnly
              ? t("emptySearch")
              : t("empty")
            : null
        }
        grid={<ProductsGrid products={products} />}
        list={<ProductsList products={products} />}
      />
    </Suspense>
  );
}
export default ProductsContainer;
