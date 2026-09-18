import AccountEmptyState from "@/components/account/AccountEmptyState";
import RemoveFavoriteButton from "@/components/account/RemoveFavoriteButton";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  tableActionsClassName,
  tableLinkClassName,
} from "@/components/ui/table";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { fetchUserFavorites } from "@/utils/actions";
import { formatCurrency } from "@/utils/format";
import { getLocale, getTranslations } from "next-intl/server";
import { LuHeart } from "react-icons/lu";

export default async function AccountFavoritesPage() {
  const t = await getTranslations("AccountCabinet");
  const tOrders = await getTranslations("Orders");
  const tVehicle = await getTranslations("VehicleCard");
  const locale = await getLocale();
  const favorites = await fetchUserFavorites();

  if (favorites.length === 0) {
    return (
      <AccountEmptyState
        icon={LuHeart}
        title={t("favoritesEmptyTitle")}
        description={t("favoritesEmptyDesc")}
        actionLabel={t("browseCatalog")}
      />
    );
  }

  return (
    <div className="grid w-full min-w-0 grid-cols-1 gap-3">
      <p className="text-sm text-muted-foreground">
        {t("favoritesTotal", { count: favorites.length })}
      </p>
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{tOrders("products")}</TableHead>
                <TableHead>{t("orderTotal")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead className={tableActionsClassName}>
                  {t("actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {favorites.map((favorite) => {
                const product = favorite.product;
                const statusKey =
                  `status.${product.status}` as Parameters<typeof tVehicle>[0];
                return (
                  <TableRow key={favorite.id}>
                    <TableCell>
                      <Link
                        href={`/products/${product.id}`}
                        className={cn(
                          buttonVariants({ variant: "link" }),
                          tableLinkClassName
                        )}
                      >
                        {product.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(product.price, locale)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          product.status === "PUBLISHED"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {tVehicle(statusKey)}
                      </Badge>
                    </TableCell>
                    <TableCell className={tableActionsClassName}>
                      <RemoveFavoriteButton
                        productId={product.id}
                        favoriteId={favorite.id}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
