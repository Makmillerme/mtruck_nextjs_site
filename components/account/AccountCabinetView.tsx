"use client";

import AccountEmptyState from "@/components/account/AccountEmptyState";
import AccountOrdersView, {
  type AccountOrderRow,
} from "@/components/account/account-orders-view";
import AccountSettingsForms from "@/components/account/AccountSettingsForms";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@/i18n/navigation";
import type { TaxonomyTreeNode } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/format";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { LuHeart } from "react-icons/lu";

export type AccountCabinetTab = "orders" | "favorites" | "settings";

export type AccountFavoriteRow = {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    status: string;
  };
};

export type AccountSettingsProps = {
  name: string;
  email: string;
  image: string | null;
  phone: string | null;
  canChangePassword: boolean;
};

function syncAccountTabUrl(
  tab: AccountCabinetTab,
  sheet?: { create?: boolean; edit?: string }
) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  const parts = url.pathname.split("/");
  const accountIdx = parts.lastIndexOf("account");
  if (accountIdx >= 0) {
    url.pathname = parts.slice(0, accountIdx + 1).join("/") || "/account";
  }
  url.searchParams.set("tab", tab);
  url.searchParams.delete("create");
  url.searchParams.delete("edit");
  if (sheet?.create) url.searchParams.set("create", "1");
  if (sheet?.edit) url.searchParams.set("edit", sheet.edit);
  window.history.replaceState(null, "", url.toString());
}

function AccountFavoritesPanel({
  favorites,
  locale,
}: {
  favorites: AccountFavoriteRow[];
  locale: string;
}) {
  const t = useTranslations("AccountCabinet");
  const tOrders = useTranslations("Orders");
  const tVehicle = useTranslations("VehicleCard");

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
                  `status.${product.status}` as Parameters<
                    typeof tVehicle
                  >[0];
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

export default function AccountCabinetView({
  tab,
  locale,
  orders,
  favorites,
  tree,
  settings,
  createOpen,
  editId,
}: {
  tab: AccountCabinetTab;
  locale: string;
  orders: AccountOrderRow[];
  favorites: AccountFavoriteRow[];
  tree: TaxonomyTreeNode[];
  settings: AccountSettingsProps;
  createOpen: boolean;
  editId?: string;
}) {
  const t = useTranslations("AccountCabinet");
  const [activeTab, setActiveTab] = useState<AccountCabinetTab>(tab);

  function setTab(value: string) {
    const next: AccountCabinetTab =
      value === "favorites" || value === "settings" ? value : "orders";
    setActiveTab(next);
    syncAccountTabUrl(next);
  }

  return (
    <Tabs value={activeTab} onValueChange={setTab}>
      <TabsList className="mb-6 w-full sm:w-full" aria-label={t("navLabel")}>
        <TabsTrigger value="orders" className="sm:flex-1">
          {t("orders")}
        </TabsTrigger>
        <TabsTrigger value="favorites" className="sm:flex-1">
          {t("favorites")}
        </TabsTrigger>
        <TabsTrigger value="settings" className="sm:flex-1">
          {t("settings")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="orders" className="mt-0">
        <AccountOrdersView
          locale={locale}
          items={orders}
          tree={tree}
          createOpen={createOpen && activeTab === "orders"}
          editId={activeTab === "orders" ? editId : undefined}
          onSheetUrlChange={(sheet) => syncAccountTabUrl("orders", sheet)}
        />
      </TabsContent>
      <TabsContent value="favorites" className="mt-0">
        <AccountFavoritesPanel favorites={favorites} locale={locale} />
      </TabsContent>
      <TabsContent value="settings" className="mt-0">
        <AccountSettingsForms {...settings} />
      </TabsContent>
    </Tabs>
  );
}
