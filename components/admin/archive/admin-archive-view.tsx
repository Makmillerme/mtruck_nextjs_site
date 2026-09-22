"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import EmptyList from "@/components/global/EmptyList";
import { ConfirmDeleteCallbackIcon } from "@/components/form/ConfirmDelete";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  tableActionsClassName,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  deleteAdminOrderAction,
  deleteAdminUserAction,
  deleteProductAction,
  restoreAdminOrderAction,
  restoreAdminUserAction,
  restoreProductAction,
} from "@/utils/actions";
import { formatCurrency, formatDate } from "@/utils/format";
import { canMutateUserArchive } from "@/utils/user-roles";
import { useOptimisticListRemove } from "@/lib/admin/optimistic-list";
import { LuRotateCcw } from "react-icons/lu";

export type ArchiveTab = "sales" | "products" | "users";

export type ArchiveUserRow = {
  id: string;
  name: string;
  email: string;
  userCode: string;
  role: "USER" | "ADMIN" | "MANAGER";
  archivedAt: string | null;
  productCount: number;
  orderCount: number;
};

export type ArchiveProductRow = {
  id: string;
  name: string;
  company: string;
  price: number;
  productCode: string;
  status: "DRAFT" | "PUBLISHED" | "RESERVED" | "PREPARING" | "SOLD";
  archivedAt: string | null;
};

export type ArchiveOrderRow = {
  id: string;
  email: string;
  userName: string;
  productName: string | null;
  orderTotal: number;
  archivedAt: string | null;
};

const STATUS_KEY = {
  DRAFT: "statusDraft",
  PUBLISHED: "statusPublished",
  RESERVED: "statusReserved",
  PREPARING: "statusPreparing",
  SOLD: "statusSold",
} as const;

function RestoreIcon({
  label,
  onRestore,
}: {
  label: string;
  onRestore: () => void;
}) {
  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      className="cursor-pointer text-muted-foreground"
      aria-label={label}
      onClick={onRestore}
    >
      <LuRotateCcw />
    </Button>
  );
}

function ArchiveTable({
  empty,
  count,
  children,
}: {
  empty: boolean;
  count: number;
  children: ReactNode;
}) {
  const t = useTranslations("Admin");
  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted-foreground">
        {t("totalArchived", { count })}
      </p>
      {empty ? (
        <EmptyList heading={t("archiveEmpty")} />
      ) : (
        <Card className="shadow-sm">
          <CardContent className="p-0">{children}</CardContent>
        </Card>
      )}
    </div>
  );
}

export default function AdminArchiveView({
  locale,
  tab,
  currentUserId,
  canDelete = false,
  users,
  products,
  orders,
}: {
  locale: string;
  tab: ArchiveTab;
  currentUserId: string;
  canDelete?: boolean;
  users: ArchiveUserRow[];
  products: ArchiveProductRow[];
  orders: ArchiveOrderRow[];
}) {
  const t = useTranslations("Admin");
  const [activeTab, setActiveTab] = useState<ArchiveTab>(tab);
  const {
    optimisticItems: optimisticOrders,
    removeOptimistically: removeOrder,
  } = useOptimisticListRemove(orders);
  const {
    optimisticItems: optimisticProducts,
    removeOptimistically: removeProduct,
  } = useOptimisticListRemove(products);
  const {
    optimisticItems: optimisticUsers,
    removeOptimistically: removeUser,
  } = useOptimisticListRemove(users);

  function setTab(value: string) {
    const next: ArchiveTab =
      value === "products" || value === "users" || value === "sales"
        ? value
        : "sales";
    setActiveTab(next);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", next);
      window.history.replaceState(null, "", url.toString());
    }
  }

  return (
    <section className="grid w-full min-w-0 grid-cols-1 gap-6">
      <Tabs value={activeTab} onValueChange={setTab}>
        <TabsList className="w-full sm:w-full">
          <TabsTrigger value="sales" className="sm:flex-1">
            {t("sales")}
          </TabsTrigger>
          <TabsTrigger value="products" className="sm:flex-1">
            {t("myProducts")}
          </TabsTrigger>
          <TabsTrigger value="users" className="sm:flex-1">
            {t("users")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="mt-6">
          <ArchiveTable
            empty={optimisticOrders.length === 0}
            count={optimisticOrders.length}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("email")}</TableHead>
                  <TableHead>{t("vehicle")}</TableHead>
                  <TableHead>{t("price")}</TableHead>
                  <TableHead>{t("archivedAt")}</TableHead>
                  {canDelete ? (
                    <TableHead className={tableActionsClassName}>
                      {t("actions")}
                    </TableHead>
                  ) : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {optimisticOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="grid gap-0.5">
                        <span>{order.email}</span>
                        {order.userName ? (
                          <span className="text-xs text-muted-foreground">
                            {order.userName}
                          </span>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>{order.productName ?? "—"}</TableCell>
                    <TableCell>
                      {formatCurrency(order.orderTotal, locale)}
                    </TableCell>
                    <TableCell>
                      {order.archivedAt
                        ? formatDate(new Date(order.archivedAt), locale)
                        : "—"}
                    </TableCell>
                    {canDelete ? (
                      <TableCell className={tableActionsClassName}>
                        <div className="inline-flex items-center justify-center gap-1">
                          <RestoreIcon
                            label={t("restore")}
                            onRestore={() =>
                              removeOrder(order.id, () =>
                                restoreAdminOrderAction({
                                  orderId: order.id,
                                })
                              )
                            }
                          />
                          <ConfirmDeleteCallbackIcon
                            onConfirm={() =>
                              removeOrder(order.id, () =>
                                deleteAdminOrderAction({
                                  orderId: order.id,
                                })
                              )
                            }
                          />
                        </div>
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ArchiveTable>
        </TabsContent>

        <TabsContent value="products" className="mt-6">
          <ArchiveTable
            empty={optimisticProducts.length === 0}
            count={optimisticProducts.length}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("userCode")}</TableHead>
                  <TableHead>{t("productName")}</TableHead>
                  <TableHead>{t("company")}</TableHead>
                  <TableHead>{t("price")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead>{t("archivedAt")}</TableHead>
                  {canDelete ? (
                    <TableHead className={tableActionsClassName}>
                      {t("actions")}
                    </TableHead>
                  ) : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {optimisticProducts.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="tabular-nums">
                      {item.productCode}
                    </TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.company}</TableCell>
                    <TableCell>
                      {formatCurrency(item.price, locale)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {t(STATUS_KEY[item.status])}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.archivedAt
                        ? formatDate(new Date(item.archivedAt), locale)
                        : "—"}
                    </TableCell>
                    {canDelete ? (
                      <TableCell className={tableActionsClassName}>
                        <div className="inline-flex items-center justify-center gap-1">
                          <RestoreIcon
                            label={t("restore")}
                            onRestore={() =>
                              removeProduct(item.id, () =>
                                restoreProductAction({
                                  productId: item.id,
                                })
                              )
                            }
                          />
                          <ConfirmDeleteCallbackIcon
                            onConfirm={() =>
                              removeProduct(item.id, () =>
                                deleteProductAction({
                                  productId: item.id,
                                })
                              )
                            }
                          />
                        </div>
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ArchiveTable>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <ArchiveTable
            empty={optimisticUsers.length === 0}
            count={optimisticUsers.length}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("userCode")}</TableHead>
                  <TableHead>{t("userName")}</TableHead>
                  <TableHead>{t("email")}</TableHead>
                  <TableHead>{t("role")}</TableHead>
                  <TableHead>{t("archivedAt")}</TableHead>
                  {canDelete ? (
                    <TableHead className={tableActionsClassName}>
                      {t("actions")}
                    </TableHead>
                  ) : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {optimisticUsers.map((item) => {
                  const canMutate = canMutateUserArchive(item, currentUserId);
                  const canHardDelete =
                    canMutate &&
                    item.productCount === 0 &&
                    item.orderCount === 0;
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="tabular-nums">
                        {item.userCode}
                      </TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={item.role === "USER" ? "secondary" : "default"}
                        >
                          {item.role === "ADMIN"
                            ? t("roleAdmin")
                            : item.role === "MANAGER"
                              ? t("roleManager")
                              : t("roleUser")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.archivedAt
                          ? formatDate(new Date(item.archivedAt), locale)
                          : "—"}
                      </TableCell>
                      {canDelete && canMutate ? (
                        <TableCell className={tableActionsClassName}>
                          <div className="inline-flex items-center justify-center gap-1">
                            <RestoreIcon
                              label={t("restore")}
                              onRestore={() =>
                                removeUser(item.id, () =>
                                  restoreAdminUserAction({
                                    userId: item.id,
                                  })
                                )
                              }
                            />
                            {canHardDelete ? (
                              <ConfirmDeleteCallbackIcon
                                onConfirm={() =>
                                  removeUser(item.id, () =>
                                    deleteAdminUserAction({
                                      userId: item.id,
                                    })
                                  )
                                }
                              />
                            ) : null}
                          </div>
                        </TableCell>
                      ) : canDelete ? (
                        <TableCell className={tableActionsClassName} />
                      ) : null}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ArchiveTable>
        </TabsContent>
      </Tabs>
    </section>
  );
}
