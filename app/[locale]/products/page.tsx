import ProductsContainer from "@/components/products/ProductsContainer";
import {
  CATALOG_LAYOUT_COOKIE,
  parseCatalogLayout,
} from "@/utils/catalog-layout";
import {
  parseCatalogBrands,
  parseCatalogSort,
  parseFeaturedOnly,
} from "@/utils/catalog-query";
import { cookies } from "next/headers";

async function ProductsPage(props: {
  searchParams: Promise<{
    layout?: string;
    search?: string;
    sort?: string;
    brand?: string | string[];
    featured?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const cookieStore = await cookies();
  const layout = parseCatalogLayout(
    searchParams.layout || cookieStore.get(CATALOG_LAYOUT_COOKIE)?.value
  );
  const search = searchParams.search || "";
  const sort = parseCatalogSort(searchParams.sort);
  const brands = parseCatalogBrands(searchParams.brand);
  const featuredOnly = parseFeaturedOnly(searchParams.featured);

  return (
    <ProductsContainer
      layout={layout}
      search={search}
      sort={sort}
      brands={brands}
      featuredOnly={featuredOnly}
    />
  );
}
export default ProductsPage;
