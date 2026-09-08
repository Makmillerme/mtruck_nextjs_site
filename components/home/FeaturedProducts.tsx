import { fetchFeaturedProducts } from "@/utils/actions";
import EmptyList from "../global/EmptyList";
import ProductsGrid from "../products/ProductsGrid";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

async function FeaturedProducts() {
  const t = await getTranslations("HomePage");
  const products = await fetchFeaturedProducts();
  if (products.length === 0) {
    return (
      <section id="inventory" className="page-container scroll-mt-16 pt-16 lg:pt-24">
        <EmptyList />
      </section>
    );
  }

  return (
    <section id="inventory" className="page-container scroll-mt-16 pt-16 lg:pt-24">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          {t("catalogEyebrow")}
        </p>
        <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground lg:text-4xl">
          {t("featuredTitle")}
        </h2>
      </div>
      <ProductsGrid products={products} />
      <div className="mt-16 text-center">
        <Button
          asChild
          variant="outline"
          size="lg"
          className="border-primary bg-transparent px-6 text-primary hover:bg-primary hover:text-primary-foreground"
        >
          <Link href="/products">{t("viewCatalog")}</Link>
        </Button>
      </div>
    </section>
  );
}
export default FeaturedProducts;
