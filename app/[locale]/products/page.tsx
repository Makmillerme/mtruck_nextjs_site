import ProductsContainer from "@/components/products/ProductsContainer";
import {
  CATALOG_LAYOUT_COOKIE,
  parseCatalogLayout,
} from "@/utils/catalog-layout";
import { parseCatalogQuery } from "@/utils/catalog-query";
import { cookies } from "next/headers";

async function ProductsPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = await props.searchParams;
  const cookieStore = await cookies();
  const parsed = parseCatalogQuery(searchParams);
  const layout = parseCatalogLayout(
    parsed.layout || cookieStore.get(CATALOG_LAYOUT_COOKIE)?.value
  );

  return (
    <ProductsContainer
      layout={layout}
      query={{
        search: parsed.search,
        sort: parsed.sort,
        featuredOnly: parsed.featuredOnly,
        folders: parsed.folders,
        facets: parsed.facets,
        ranges: parsed.ranges,
        page: parsed.page,
        pageSize: parsed.pageSize,
      }}
    />
  );
}
export default ProductsPage;
