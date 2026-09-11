"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import EmptyList from "@/components/global/EmptyList";
import { CatalogField } from "@/components/admin/catalog/catalog-fields";
import { IconButton, SubmitButton } from "@/components/form/Buttons";
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
} from "@/components/ui/table";
import {
  createAdminOrderAction,
  deleteAdminOrderAction,
  updateAdminOrderAction,
} from "@/utils/actions";
import type { actionFunction } from "@/utils/types";
import { formatCurrency, formatDate } from "@/utils/format";
import AdminListToolbar, {
  AdminFilterTrigger,
} from "@/components/admin/admin-list-toolbar";
import { LuPen } from "react-icons/lu";

export type AdminOrderRow = {
  id: string;
  email: string;
  userId: string;
  userName: string;
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
};

export type AdminOrderProductOption = {
  id: string;
  name: string;
  company: string;
  price: number;
};

function DeleteOrder({ orderId }: { orderId: string }) {
  const deleteOrder = deleteAdminOrderAction.bind(null, {
    orderId,
  }) as unknown as actionFunction;
  return (
    <FormContainer action={deleteOrder}>
      <IconButton actionType="delete" />
    </FormContainer>
  );
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
      <div className="grid gap-2">
        <label htmlFor="userId" className="text-sm font-medium">
          {t("customer")}
        </label>
        <select
          id="userId"
          name="userId"
          required
          value={userId}
          onChange={(event) => setUserId(event.target.value)}
          className="flex h-11 w-full rounded-sm border border-input bg-background px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">{t("selectCustomer")}</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name ? `${user.name} · ${user.email}` : user.email}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <label htmlFor="productId" className="text-sm font-medium">
          {t("vehicle")}
        </label>
        <select
          id="productId"
          name="productId"
          value={productId ?? ""}
          onChange={(event) => onProductChange(event.target.value)}
          className="flex h-11 w-full rounded-sm border border-input bg-background px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">{t("selectVehicle")}</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} · {product.company}
            </option>
          ))}
        </select>
      </div>

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
}: {
  items: AdminOrderRow[];
  users: AdminOrderUserOption[];
  products: AdminOrderProductOption[];
  locale: string;
  createOpen: boolean;
  editId?: string;
}) {
  const t = useTranslations("Admin");
  const tOrders = useTranslations("Orders");
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [paidFilter, setPaidFilter] = useState<"all" | "paid" | "unpaid">(
    "all"
  );

  const editOrder = useMemo(
    () => items.find((item) => item.id === editId) ?? null,
    [items, editId]
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
    if (open) {
      router.replace("/admin/sales?create=1", { scroll: false });
      return;
    }
    router.replace("/admin/sales", { scroll: false });
  }

  function setEditOpen(open: boolean, orderId?: string) {
    if (open && orderId) {
      router.replace(`/admin/sales?edit=${orderId}`, { scroll: false });
      return;
    }
    router.replace("/admin/sales", { scroll: false });
  }

  return (
    <section className="grid min-w-0 gap-6">
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
            <SheetContent
              side="right"
              className="flex w-full flex-col gap-6 sm:max-w-sm"
            >
              <SheetHeader className="text-left">
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

      <p className="text-sm text-muted-foreground">
        {t("totalOrders", { count: filtered.length })}
      </p>

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
                  <TableHead>{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((order) => (
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
                    <TableCell>
                      {order.productName ?? t("vehicleUnset")}
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
                    <TableCell>
                      <div className="flex items-center gap-1">
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
                        <DeleteOrder orderId={order.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-lg"
        >
          <div className="grid gap-6 p-6">
            <SheetHeader className="text-left">
              <SheetTitle>{t("createOrderSheetTitle")}</SheetTitle>
              <SheetDescription>{t("createOrderSheetLede")}</SheetDescription>
            </SheetHeader>
            <FormContainer
              key={createOpen ? "create-open" : "create-closed"}
              action={createAdminOrderAction}
            >
              <div className="grid gap-6">
                <OrderFormFields users={users} products={products} />
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
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-lg"
        >
          <div className="grid gap-6 p-6">
            <SheetHeader className="text-left">
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
                      deleteFormId="delete-order-form"
                    />
                  </div>
                </FormContainer>
                <FormContainer
                  id="delete-order-form"
                  className="hidden"
                  action={
                    deleteAdminOrderAction.bind(null, {
                      orderId: editOrder.id,
                    }) as unknown as actionFunction
                  }
                >
                  <input type="hidden" name="orderId" value={editOrder.id} />
                </FormContainer>
              </>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
}
