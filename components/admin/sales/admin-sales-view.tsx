"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import EmptyList from "@/components/global/EmptyList";
import { CatalogField } from "@/components/admin/catalog/catalog-fields";
import { SubmitButton } from "@/components/form/Buttons";
import { ConfirmDeleteIcon } from "@/components/form/ConfirmDelete";
import SheetFormActions from "@/components/admin/sheet-form-actions";
import FormContainer from "@/components/form/FormContainer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
import {
  archiveAdminOrderAction,
  createAdminOrderAction,
  updateAdminOrderAction,
} from "@/utils/actions";
import type { actionFunction } from "@/utils/types";
import { formatCurrency, formatDate } from "@/utils/format";
import AdminListToolbar, {
  AdminFilterTrigger,
} from "@/components/admin/admin-list-toolbar";
import SearchableEntityPicker from "@/components/admin/searchable-entity-picker";
import { syncAdminSheetUrl } from "@/lib/admin/sheet-url";
import { LuArchive, LuPen } from "react-icons/lu";

export type AdminOrderRow = {
  id: string;
  email: string;
  userId: string;
  userName: string;
  kind: "CATALOG" | "REQUEST";
  status: "NEW" | "IN_PROGRESS" | "CLOSED";
  productId: string | null;
  productName: string | null;
  products: number;
  orderTotal: number;
  tax: number;
  shipping: number;
  isPaid: boolean;
  createdAt: string;
};

export type AdminOrderUserOption = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  userCode: string;
};

export type AdminOrderProductOption = {
  id: string;
  name: string;
  company: string;
  price: number;
  productCode: string;
  status: string;
};

function ArchiveOrder({ orderId }: { orderId: string }) {
  const archiveOrder = archiveAdminOrderAction.bind(null, {
    orderId,
  }) as unknown as actionFunction;
  return <ConfirmDeleteIcon action={archiveOrder} mode="archive" />;
}

function OrderFormFields({
  users,
  products,
  defaults,
}: {
  users: AdminOrderUserOption[];
  products: AdminOrderProductOption[];
  defaults?: {
    userId?: string;
    productId?: string | null;
    products?: number;
    orderTotal?: number;
    tax?: number;
    shipping?: number;
    isPaid?: boolean;
  };
}) {
  const t = useTranslations("Admin");
  const tOrders = useTranslations("Orders");
  const [userId, setUserId] = useState(defaults?.userId ?? "");
  const [productId, setProductId] = useState(defaults?.productId ?? "");
  const [orderTotal, setOrderTotal] = useState(
    String(defaults?.orderTotal ?? 0)
  );
  const [productsCount, setProductsCount] = useState(
    String(defaults?.products ?? 1)
  );
  const [isPaid, setIsPaid] = useState(defaults?.isPaid ?? false);

  const userOptions = useMemo(
    () =>
      users.map((user) => ({
        value: user.id,
        label: user.name
          ? `${user.userCode} · ${user.name} · ${user.email}`
          : `${user.userCode} · ${user.email}`,
        keywords: [
          user.userCode,
          user.name,
          user.email,
          user.phone ?? "",
        ],
      })),
    [users]
  );

  const productOptions = useMemo(
    () =>
      products.map((product) => ({
        value: product.id,
        label: `${product.productCode} · ${product.name} · ${product.company}`,
        keywords: [
          product.productCode,
          product.name,
          product.company,
          product.status,
        ],
      })),
    [products]
  );

  function onProductChange(nextId: string) {
    setProductId(nextId);
    if (!nextId) return;
    const product = products.find((item) => item.id === nextId);
    if (!product) return;
    setOrderTotal(String(product.price));
    setProductsCount("1");
  }

  return (
    <div className="grid gap-4">
      <SearchableEntityPicker
        name="userId"
        label={t("customer")}
        placeholder={t("selectCustomer")}
        searchPlaceholder={t("searchCustomerPlaceholder")}
        emptyLabel={t("searchNoResults")}
        options={userOptions}
        value={userId}
        onValueChange={setUserId}
        required
        allowClear={false}
      />

      <SearchableEntityPicker
        name="productId"
        label={t("vehicle")}
        placeholder={t("selectVehicle")}
        searchPlaceholder={t("searchVehiclePlaceholder")}
        emptyLabel={t("searchNoResults")}
        options={productOptions}
        value={productId ?? ""}
        onValueChange={onProductChange}
        allowClear
        clearLabel={t("vehicleUnset")}
      />

      <CatalogField
        name="products"
        label={tOrders("products")}
        defaultValue={productsCount}
        key={`products-${productsCount}`}
      />
      <CatalogField
        name="orderTotal"
        label={tOrders("orderTotal")}
        defaultValue={orderTotal}
        key={`total-${orderTotal}`}
      />
      <CatalogField
        name="tax"
        label={tOrders("tax")}
        defaultValue={String(defaults?.tax ?? 0)}
      />
      <CatalogField
        name="shipping"
        label={tOrders("shipping")}
        defaultValue={String(defaults?.shipping ?? 0)}
      />
      <label
        htmlFor="isPaid"
        className="flex cursor-pointer items-center gap-3 text-sm"
      >
        <Checkbox
          id="isPaid"
          checked={isPaid}
          onCheckedChange={(value) => setIsPaid(value === true)}
        />
        <input type="hidden" name="isPaid" value={isPaid ? "on" : ""} />
        {t("paid")}
      </label>
    </div>
  );
}

export default function AdminSalesView({
  items,
  users,
  products,
  locale,
  createOpen,
  editId,
  preselectedUserId,
  canDelete = false,
}: {
  items: AdminOrderRow[];
  users: AdminOrderUserOption[];
  products: AdminOrderProductOption[];
  locale: string;
  createOpen: boolean;
  editId?: string;
  preselectedUserId?: string;
  canDelete?: boolean;
}) {
  const t = useTranslations("Admin");
  const tOrders = useTranslations("Orders");
  const [search, setSearch] = useState("");
  const [paidFilter, setPaidFilter] = useState<"all" | "paid" | "unpaid">(
    "all"
  );
  const [sheetCreateOpen, setSheetCreateOpen] = useState(createOpen);
  const [sheetEditId, setSheetEditId] = useState<string | undefined>(editId);

  const editOrder = useMemo(
    () => items.find((item) => item.id === sheetEditId) ?? null,
    [items, sheetEditId]
  );

  const activeFilterCount = paidFilter === "all" ? 0 : 1;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (q) {
        const hay = `${item.email} ${item.userName} ${item.productName ?? ""}`
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (paidFilter === "paid" && !item.isPaid) return false;
      if (paidFilter === "unpaid" && item.isPaid) return false;
      return true;
    });
  }, [items, search, paidFilter]);

  function setCreateOpen(open: boolean) {
    setSheetCreateOpen(open);
    if (open) {
      setSheetEditId(undefined);
      syncAdminSheetUrl({
        create: true,
        userId: preselectedUserId,
      });
      return;
    }
    syncAdminSheetUrl({});
  }

  function setEditOpen(open: boolean, orderId?: string) {
    if (open && orderId) {
      setSheetCreateOpen(false);
      setSheetEditId(orderId);
      syncAdminSheetUrl({ edit: orderId });
      return;
    }
    setSheetEditId(undefined);
    syncAdminSheetUrl({});
  }

  return (
    <section className="grid w-full min-w-0 grid-cols-1 gap-6">
      <AdminListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t("searchOrdersPlaceholder")}
        createLabel={t("createOrder")}
        onCreate={() => setCreateOpen(true)}
        filterSheet={
          <Sheet>
            <SheetTrigger asChild>
              <AdminFilterTrigger
                label={t("filter")}
                count={activeFilterCount}
              />
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>{t("filter")}</SheetTitle>
              </SheetHeader>
              <div className="grid gap-6 overflow-y-auto">
                <div className="grid gap-3">
                  <p className="text-sm font-medium">{t("filterPayment")}</p>
                  {(
                    [
                      ["all", t("filterPaymentAll")],
                      ["paid", t("paid")],
                      ["unpaid", t("unpaid")],
                    ] as const
                  ).map(([value, label]) => {
                    const id = `admin-order-paid-${value}`;
                    return (
                      <label
                        key={value}
                        htmlFor={id}
                        className="flex cursor-pointer items-center gap-3 text-sm"
                      >
                        <Checkbox
                          id={id}
                          checked={paidFilter === value}
                          onCheckedChange={(checked) => {
                            if (checked === true) setPaidFilter(value);
                          }}
                        />
                        {label}
                      </label>
                    );
                  })}
                </div>
                {activeFilterCount > 0 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPaidFilter("all")}
                  >
                    {t("clearFilters")}
                  </Button>
                ) : null}
              </div>
            </SheetContent>
          </Sheet>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {t("totalOrders", { count: filtered.length })}
        </p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/archive?tab=sales">
            <LuArchive className="size-4" />
            {t("archive")}
          </Link>
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyList />
      ) : (
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("email")}</TableHead>
                  <TableHead>{t("vehicle")}</TableHead>
                  <TableHead>{tOrders("orderTotal")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead>{tOrders("date")}</TableHead>
                  <TableHead className={tableActionsClassName}>
                    {t("actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Button
                        variant="link"
                        asChild
                        className={tableLinkClassName}
                      >
                        <Link href={`/admin/users?edit=${order.userId}`}>
                          <span className="grid gap-0.5 text-left">
                            <span>{order.email}</span>
                            {order.userName ? (
                              <span className="text-xs text-muted-foreground">
                                {order.userName}
                              </span>
                            ) : null}
                          </span>
                        </Link>
                      </Button>
                    </TableCell>
                    <TableCell>
                      {order.productId && order.productName ? (
                        <Button
                          variant="link"
                          asChild
                          className={tableLinkClassName}
                        >
                          <Link href={`/products/${order.productId}`}>
                            {order.productName}
                          </Link>
                        </Button>
                      ) : (
                        (order.productName ?? t("vehicleUnset"))
                      )}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(order.orderTotal, locale)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={order.isPaid ? "default" : "secondary"}>
                        {order.isPaid ? t("paid") : t("unpaid")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDate(new Date(order.createdAt), locale)}
                    </TableCell>
                    <TableCell className={tableActionsClassName}>
                      <div className="inline-flex items-center justify-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="cursor-pointer text-muted-foreground"
                          onClick={() => setEditOpen(true, order.id)}
                          aria-label={t("editOrder")}
                        >
                          <LuPen />
                        </Button>
                        {canDelete ? (
                          <ArchiveOrder orderId={order.id} />
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Sheet open={sheetCreateOpen} onOpenChange={setCreateOpen}>
        <SheetContent>
          <div className="grid gap-6">
            <SheetHeader>
              <SheetTitle>{t("createOrderSheetTitle")}</SheetTitle>
              <SheetDescription>{t("createOrderSheetLede")}</SheetDescription>
            </SheetHeader>
            <FormContainer
              key={sheetCreateOpen ? "create-open" : "create-closed"}
              action={createAdminOrderAction}
            >
              <div className="grid gap-6">
                <OrderFormFields
                  users={users}
                  products={products}
                  defaults={{
                    userId: preselectedUserId,
                  }}
                />
                <SubmitButton text={t("submitCreateOrder")} className="w-fit" />
              </div>
            </FormContainer>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet
        open={Boolean(editOrder)}
        onOpenChange={(open) => setEditOpen(open, editOrder?.id)}
      >
        <SheetContent>
          <div className="grid gap-6">
            <SheetHeader>
              <SheetTitle>{t("editOrderSheetTitle")}</SheetTitle>
              <SheetDescription>{t("editOrderSheetLede")}</SheetDescription>
            </SheetHeader>
            {editOrder ? (
              <>
                <FormContainer
                  key={editOrder.id}
                  action={updateAdminOrderAction}
                >
                  <input type="hidden" name="orderId" value={editOrder.id} />
                  <div className="grid gap-6">
                    <OrderFormFields
                      users={users}
                      products={products}
                      defaults={{
                        userId: editOrder.userId,
                        productId: editOrder.productId,
                        products: editOrder.products,
                        orderTotal: editOrder.orderTotal,
                        tax: editOrder.tax,
                        shipping: editOrder.shipping,
                        isPaid: editOrder.isPaid,
                      }}
                    />
                    <SheetFormActions
                      saveLabel={t("submitUpdate")}
                      deleteFormId={
                        canDelete ? "archive-order-form" : undefined
                      }
                    />
                  </div>
                </FormContainer>
                {canDelete ? (
                  <FormContainer
                    id="archive-order-form"
                    className="hidden"
                    action={
                      archiveAdminOrderAction.bind(null, {
                        orderId: editOrder.id,
                      }) as unknown as actionFunction
                    }
                  >
                    <input type="hidden" name="orderId" value={editOrder.id} />
                  </FormContainer>
                ) : null}
              </>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
}
