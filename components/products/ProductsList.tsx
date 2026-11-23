import ProductCard from "@/components/products/product-card";
import type { CardPreviewLayoutResolved } from "@/lib/catalog/card-preview";
import { productWithSpecsToCardModel } from "@/lib/catalog/product-to-card";
import { getBuyerCurrencyCookie } from "@/lib/finance/buyer-currency";
import { resolveStorefrontPriceDisplay } from "@/lib/finance/storefront-card-price";
import type { ProductListItem } from "@/utils/product-list";
import { getLocale } from "next-intl/server";

async function ProductsList({
  products,
  layouts,
  favoriteByProductId,
  isAuthenticated,
  priorityCount = 0,
}: {
  products: ProductListItem[];
  layouts?: Map<string, CardPreviewLayoutResolved>;
  favoriteByProductId?: Map<string, string>;
  isAuthenticated?: boolean;
  priorityCount?: number;
}) {
  const [locale, buyerCurrency] = await Promise.all([
    getLocale(),
    getBuyerCurrencyCookie(),
  ]);
  const displays = await Promise.all(
    products.map((product) =>
      resolveStorefrontPriceDisplay(product, locale, buyerCurrency)
    )
  );
  return (
    <div className="grid gap-4 md:gap-5">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          layout="list"
          product={productWithSpecsToCardModel(
            product,
            product.taxonomyNodeId
              ? layouts?.get(product.taxonomyNodeId)
              : undefined,
            locale,
            displays[index]
          )}
          priority={index < priorityCount}
          favoriteId={favoriteByProductId?.get(product.id) ?? null}
          isAuthenticated={isAuthenticated}
        />
      ))}
    </div>
  );
}
export default ProductsList;
