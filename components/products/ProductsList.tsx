import { formatCurrency } from "@/utils/format";
import { Link } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ProductListItem } from "@/utils/product-list";
import Image from "next/image";
import FavoriteToggleButton from "./FavoriteToggleButton";
import { LuTag } from "react-icons/lu";

async function ProductsList({
  products,
  favoriteByProductId,
  isAuthenticated,
  priorityCount = 0,
}: {
  products: ProductListItem[];
  favoriteByProductId?: Map<string, string>;
  isAuthenticated?: boolean;
  priorityCount?: number;
}) {
  const locale = await getLocale();
  const t = await getTranslations("Product");

  return (
    <div className="mt-8 grid gap-6">
      {products.map((product, index) => {
        const href = `/products/${product.id}`;
        const price = formatCurrency(product.price, locale);
        return (
          <article key={product.id} className="group">
            <Card className="overflow-hidden border-border/80 shadow-sm transition-all duration-300 hover:shadow-lg">
              <CardContent className="grid gap-6 p-4 md:grid-cols-[minmax(0,16rem)_1fr_auto] md:items-center md:p-5">
                <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-[#1a1a2e] md:aspect-auto md:h-36">
                  <Link href={href} className="absolute inset-0">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      priority={index < priorityCount}
                      sizes="(max-width: 768px) 100vw, 256px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>
                </div>
                <div className="space-y-3">
                  <Link href={href} className="space-y-1">
                    <h3 className="text-lg font-semibold tracking-tight">
                      {product.name}
                    </h3>
                    <p className="font-mono text-2xl font-black text-primary">
                      {price}
                    </p>
                  </Link>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="secondary"
                      className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/10"
                    >
                      <LuTag className="mr-1 size-3.5" aria-hidden />
                      {product.company}
                    </Badge>
                    {product.featured ? (
                      <Badge
                        variant="secondary"
                        className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted"
                      >
                        {t("featuredBadge")}
                      </Badge>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center gap-3 md:flex-col md:items-end">
                  <FavoriteToggleButton
                    productId={product.id}
                    favoriteId={favoriteByProductId?.get(product.id) ?? null}
                    isAuthenticated={isAuthenticated}
                  />
                  <Button asChild className="h-10 font-semibold md:w-40">
                    <Link href={href}>{t("details")}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </article>
        );
      })}
    </div>
  );
}
export default ProductsList;
