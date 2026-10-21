import EmptyList from "@/components/global/EmptyList";
import ProductsGrid from "@/components/products/ProductsGrid";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { fetchCardPreviewLayoutsByNodeIds } from "@/lib/catalog/card-preview";
import { fetchFeaturedProducts, fetchUserFavoriteIds } from "@/utils/actions";
import db from "@/utils/db";
import { getTranslations } from "next-intl/server";

/** Featured vehicles grid only — no section title (CatalogBlock owns headings). */
export default async function CatalogFeaturedGrid() {
  const t = await getTranslations("HomePage");
  const [products, favorites] = await Promise.all([
    fetchFeaturedProducts(),
    fetchUserFavoriteIds(),
  ]);

  if (products.length === 0) {
    return <EmptyList />;
  }

  const layouts = await fetchCardPreviewLayoutsByNodeIds(
    db,
    products
      .map((product) => product.taxonomyNodeId)
      .filter((id): id is string => Boolean(id))
  );

  return (
    <div>
      <ProductsGrid
        products={products}
        layouts={layouts}
        favoriteByProductId={favorites.favoriteByProductId}
        isAuthenticated={favorites.isAuthenticated}
        priorityCount={3}
      />
      <div className="mt-12 text-center md:mt-16">
        <Button asChild variant="outline" size="lg">
          <Link href="/products">{t("viewCatalog")}</Link>
        </Button>
      </div>
    </div>
  );
}
