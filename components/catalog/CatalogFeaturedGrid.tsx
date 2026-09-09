import EmptyList from "@/components/global/EmptyList";
import ProductsGrid from "@/components/products/ProductsGrid";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { fetchFeaturedProducts, fetchUserFavoriteIds } from "@/utils/actions";
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

  return (
    <div>
      <ProductsGrid
        products={products}
        favoriteByProductId={favorites.favoriteByProductId}
        isAuthenticated={favorites.isAuthenticated}
        priorityCount={3}
      />
      <div className="mt-12 text-center md:mt-16">
        <Button
          asChild
          variant="outline"
          size="lg"
          className="border-primary bg-background px-6 text-primary hover:bg-primary hover:text-primary-foreground"
        >
          <Link href="/products">{t("viewCatalog")}</Link>
        </Button>
      </div>
    </div>
  );
}
