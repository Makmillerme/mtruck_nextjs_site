"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import ProductFolderPicker from "@/components/admin/catalog/product-folder-picker";
import AdminListToolbar from "@/components/admin/admin-list-toolbar";
import SheetFormActions from "@/components/admin/sheet-form-actions";
import { SubmitButton } from "@/components/form/Buttons";
import { ConfirmDeleteIcon } from "@/components/form/ConfirmDelete";
import FormContainer from "@/components/form/FormContainer";
import EmptyList from "@/components/global/EmptyList";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
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
import { Textarea } from "@/components/ui/textarea";
import type { TaxonomyTreeNode } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";
import {
  createUserRequestOrderAction,
  deleteUserOrderAction,
  updateUserOrderAction,
} from "@/utils/actions";
import type { actionFunction } from "@/utils/types";
import { formatCurrency, formatDate } from "@/utils/format";
import { LuPen } from "react-icons/lu";

export type AccountOrderRow = {
  id: string;
  kind: "CATALOG" | "REQUEST";
  status: "NEW" | "IN_PROGRESS" | "CLOSED";
  origin: "USER" | "ADMIN";
  productId: string | null;
  productName: string | null;
  taxonomyNodeId: string | null;
  taxonomyNodeName: string | null;
  note: string | null;
  orderTotal: number;
  createdAt: string;
};

function canEditOrder(order: AccountOrderRow) {
  return order.status === "NEW";
}

function DeleteOrder({ orderId }: { orderId: string }) {
  const deleteOrder = deleteUserOrderAction.bind(null, {
    orderId,
  }) as unknown as actionFunction;
  return <ConfirmDeleteIcon action={deleteOrder} />;
}

function OrderRequestFields({
  tree,
  taxonomyNodeId,
  note,
}: {
  tree: TaxonomyTreeNode[];
  taxonomyNodeId?: string | null;
  note?: string | null;
}) {
  const t = useTranslations("AccountCabinet");
  const [folderId, setFolderId] = useState(taxonomyNodeId ?? "");

  return (
    <div className="grid gap-6">
      <ProductFolderPicker
        tree={tree}
        selectedId={folderId || undefined}
        onNodeChange={(id) => setFolderId(id ?? "")}
      />
      <div className="grid gap-2">
        <Label htmlFor="note">{t("orderNote")}</Label>
        <Textarea
          id="note"
          name="note"
          rows={5}
          defaultValue={note ?? ""}
          className="leading-loose"
        />
      </div>
    </div>
  );
}

export default function AccountOrdersView({
  items,
  tree,
  locale,
  createOpen,
  editId,
}: {
  items: AccountOrderRow[];
  tree: TaxonomyTreeNode[];
  locale: string;
  createOpen: boolean;
  editId?: string;
}) {
  const t = useTranslations("AccountCabinet");
  const tOrders = useTranslations("Orders");
  const tAdmin = useTranslations("Admin");
  const router = useRouter();
  const [search, setSearch] = useState("");

  const editOrder = useMemo(
    () => items.find((item) => item.id === editId) ?? null,
    [items, editId]
  );
  const editAllowed = editOrder ? canEditOrder(editOrder) : false;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const hay = `${item.productName ?? ""} ${item.taxonomyNodeName ?? ""} ${item.note ?? ""}`;
      return hay.toLowerCase().includes(q);
    });
  }, [items, search]);

  function setCreateOpen(open: boolean) {
    if (open) {
      router.replace("/account/orders?create=1", { scroll: false });
      return;
    }
    router.replace("/account/orders", { scroll: false });
  }

  function setEditOpen(open: boolean, orderId?: string) {
    if (open && orderId) {
      router.replace(`/account/orders?edit=${orderId}`, { scroll: false });
      return;
    }
    router.replace("/account/orders", { scroll: false });
  }

  return (
    <section className="grid w-full min-w-0 grid-cols-1 gap-6">
      <AdminListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t("searchOrdersPlaceholder")}
        createLabel={t("createOrder")}
        onCreate={() => setCreateOpen(true)}
      />

      <p className="text-sm text-muted-foreground">
        {t("ordersTotal", { count: filtered.length })}
      </p>

      {filtered.length === 0 ? (
        <EmptyList />
      ) : (
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{tOrders("products")}</TableHead>
                  <TableHead>{t("kind")}</TableHead>
                  <TableHead>{t("orderTotal")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead>{t("date")}</TableHead>
                  <TableHead className={tableActionsClassName}>
                    {t("actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      {order.productId && order.productName ? (
                        <Link
                          href={`/products/${order.productId}`}
                          className={cn(
                            buttonVariants({ variant: "link" }),
                            tableLinkClassName
                          )}
                        >
                          {order.productName}
                        </Link>
                      ) : (
                        (order.taxonomyNodeName ?? tOrders("customRequest"))
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="soft">
                        {order.kind === "REQUEST"
                          ? tOrders("kindRequest")
                          : tOrders("kindCatalog")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(order.orderTotal, locale)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.status === "CLOSED" ? "secondary" : "default"
                        }
                      >
                        {order.status === "IN_PROGRESS"
                          ? tOrders("statusInProgress")
                          : order.status === "CLOSED"
                            ? tOrders("statusClosed")
                            : tOrders("statusNew")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDate(new Date(order.createdAt), locale)}
                    </TableCell>
                    <TableCell className={tableActionsClassName}>
                      {canEditOrder(order) ? (
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
                          <DeleteOrder orderId={order.id} />
                        </div>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <SheetContent>
          <div className="grid gap-6">
            <SheetHeader>
              <SheetTitle>{t("createOrderSheetTitle")}</SheetTitle>
              <SheetDescription>{t("createOrderSheetLede")}</SheetDescription>
            </SheetHeader>
            <FormContainer
              key={createOpen ? "create-open" : "create-closed"}
              action={createUserRequestOrderAction}
            >
              <div className="grid gap-6">
                <OrderRequestFields tree={tree} />
                <SubmitButton text={t("submitCreateOrder")} className="w-fit" />
              </div>
            </FormContainer>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet
        open={Boolean(editAllowed && editOrder)}
        onOpenChange={(open) => setEditOpen(open, editOrder?.id)}
      >
        <SheetContent>
          <div className="grid gap-6">
            <SheetHeader>
              <SheetTitle>{t("editOrderSheetTitle")}</SheetTitle>
              <SheetDescription>{t("editOrderSheetLede")}</SheetDescription>
            </SheetHeader>
            {editAllowed && editOrder ? (
              <>
              <FormContainer key={editOrder.id} action={updateUserOrderAction}>
                <input type="hidden" name="orderId" value={editOrder.id} />
                <div className="grid gap-6">
                  {editOrder.kind === "REQUEST" ? (
                    <OrderRequestFields
                      tree={tree}
                      taxonomyNodeId={editOrder.taxonomyNodeId}
                      note={editOrder.note}
                    />
                  ) : (
                    <div className="grid gap-6">
                      <p className="text-sm text-muted-foreground">
                        {t("catalogOrderLockedHint")}
                      </p>
                      {editOrder.productId && editOrder.productName ? (
                        <Link
                          href={`/products/${editOrder.productId}`}
                          className={cn(
                            buttonVariants({ variant: "link" }),
                            tableLinkClassName,
                            "w-fit"
                          )}
                        >
                          {editOrder.productName}
                        </Link>
                      ) : null}
                      <div className="grid gap-2">
                        <Label htmlFor="note">{t("orderNote")}</Label>
                        <Textarea
                          id="note"
                          name="note"
                          rows={5}
                          defaultValue={editOrder.note ?? ""}
                          className="leading-loose"
                        />
                      </div>
                    </div>
                  )}
                  <SheetFormActions
                    saveLabel={tAdmin("submitUpdate")}
                    deleteFormId="delete-user-order-form"
                  />
                </div>
              </FormContainer>
              <FormContainer
                id="delete-user-order-form"
                className="hidden"
                action={
                  deleteUserOrderAction.bind(null, {
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
