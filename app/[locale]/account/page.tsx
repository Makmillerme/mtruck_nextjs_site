import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import {
  fetchUserFavorites,
  fetchUserOrders,
} from "@/utils/actions";
import { formatCurrency, formatDate } from "@/utils/format";
import { getLocale, getTranslations } from "next-intl/server";
import { LuHeart, LuPackage, LuSettings } from "react-icons/lu";

export default async function AccountOverviewPage() {
  const t = await getTranslations("AccountCabinet");
  const locale = await getLocale();
  const [orders, favorites] = await Promise.all([
    fetchUserOrders(),
    fetchUserFavorites(),
  ]);
  const recentOrders = orders.slice(0, 3);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("orders")}</CardTitle>
            <LuPackage className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{orders.length}</p>
            <Button asChild variant="link" className="mt-2 h-auto px-0">
              <Link href="/account/orders">{t("viewOrders")}</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("favorites")}</CardTitle>
            <LuHeart className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{favorites.length}</p>
            <Button asChild variant="link" className="mt-2 h-auto px-0">
              <Link href="/account/favorites">{t("viewFavorites")}</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("settings")}</CardTitle>
            <LuSettings className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t("settingsHint")}</p>
            <Button asChild variant="link" className="mt-2 h-auto px-0">
              <Link href="/account/settings">{t("openSettings")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("recentOrders")}</CardTitle>
          <CardDescription>{t("recentOrdersHint")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {recentOrders.length === 0 ? (
            <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed p-4">
              <p className="text-sm text-muted-foreground">{t("ordersEmptyDesc")}</p>
              <Button asChild size="sm">
                <Link href="/products">{t("browseCatalog")}</Link>
              </Button>
            </div>
          ) : (
            recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium">
                    {t("orderProducts", { count: order.products })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(order.createdAt, locale)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={order.isPaid ? "default" : "secondary"}>
                    {order.isPaid ? t("paid") : t("unpaid")}
                  </Badge>
                  <p className="font-medium">
                    {formatCurrency(order.orderTotal, locale)}
                  </p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
