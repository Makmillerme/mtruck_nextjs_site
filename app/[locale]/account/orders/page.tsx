import AccountEmptyState from "@/components/account/AccountEmptyState";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchUserOrders } from "@/utils/actions";
import { formatCurrency, formatDate } from "@/utils/format";
import { getLocale, getTranslations } from "next-intl/server";
import { LuPackage } from "react-icons/lu";

export default async function AccountOrdersPage() {
  const t = await getTranslations("AccountCabinet");
  const locale = await getLocale();
  const orders = await fetchUserOrders();

  if (orders.length === 0) {
    return (
      <AccountEmptyState
        icon={LuPackage}
        title={t("ordersEmptyTitle")}
        description={t("ordersEmptyDesc")}
        actionLabel={t("browseCatalog")}
      />
    );
  }

  return (
    <div className="grid gap-3">
      <p className="text-sm text-muted-foreground">
        {t("ordersTotal", { count: orders.length })}
      </p>
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("productsCount")}</TableHead>
              <TableHead>{t("orderTotal")}</TableHead>
              <TableHead>{t("tax")}</TableHead>
              <TableHead>{t("shipping")}</TableHead>
              <TableHead>{t("status")}</TableHead>
              <TableHead>{t("date")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  {order.product?.name ?? order.products}
                </TableCell>
                <TableCell>{formatCurrency(order.orderTotal, locale)}</TableCell>
                <TableCell>{formatCurrency(order.tax, locale)}</TableCell>
                <TableCell>{formatCurrency(order.shipping, locale)}</TableCell>
                <TableCell>
                  <Badge variant={order.isPaid ? "default" : "secondary"}>
                    {order.isPaid ? t("paid") : t("unpaid")}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(order.createdAt, locale)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
