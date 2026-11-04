"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import AccountEmptyState from "@/components/account/AccountEmptyState";
import AccountOrderLine from "@/components/account/account-order-line";
import AccountOrdersSummary from "@/components/account/account-orders-summary";
import ProductFolderPicker from "@/components/admin/catalog/product-folder-picker";
import AdminListToolbar from "@/components/admin/admin-list-toolbar";
import SheetFormActions from "@/components/admin/sheet-form-actions";
import { useCtaInquiry } from "@/components/cta/cta-inquiry";
import { SubmitButton } from "@/components/form/Buttons";
import FormContainer from "@/components/form/FormContainer";
import { useOptimisticListRemove } from "@/lib/admin/optimistic-list";
import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@/i18n/navigation";
import type { TaxonomyTreeNode } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";
import {
  createUserRequestOrderAction,
  deleteUserOrderAction,
  updateUserOrderAction,
} from "@/utils/actions";
import type { actionFunction } from "@/utils/types";
import { formatCurrency } from "@/utils/format";
import { tableLinkClassName } from "@/components/ui/table";
import { LuShoppingCart } from "react-icons/lu";

export type AccountOrderRow = {
  id: string;
  kind: "CATALOG" | "REQUEST";
  status: "NEW" | "IN_PROGRESS" | "CLOSED";
  origin: "USER" | "ADMIN";
  productId: string | null;
  productName: string | null;
  productImage: string | null;
  productCode: string | null;
  favoriteId: string | null;
  taxonomyNodeId: string | null;
  taxonomyNodeName: string | null;
  note: string | null;
  orderTotal: number;
  createdAt: string;
};

function canEditOrder(order: AccountOrderRow) {
  return order.status === "NEW";
}

function isOpenOrder(order: AccountOrderRow) {
  return order.status === "NEW" || order.status === "IN_PROGRESS";
}

function orderTitle(order: AccountOrderRow, customRequestLabel: string) {
  if (order.productName) return order.productName;
  return order.taxonomyNodeName ?? customRequestLabel;
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
  onSheetUrlChange,
}: {
  items: AccountOrderRow[];
  tree: TaxonomyTreeNode[];
  locale: string;
  createOpen: boolean;
  editId?: string;
  /** Sync sheet query without RSC (cabinet uses replaceState). */
  onSheetUrlChange?: (next: { create?: boolean; edit?: string }) => void;
}) {
  const t = useTranslations("AccountCabinet");
  const tOrders = useTranslations("Orders");
  const tAdmin = useTranslations("Admin");
  const { open: openInquiry } = useCtaInquiry();
  const { optimisticItems, removeOptimistically } =
    useOptimisticListRemove(items);
  const [search, setSearch] = useState("");
  const [sheetCreateOpen, setSheetCreateOpen] = useState(createOpen);
  const [sheetEditId, setSheetEditId] = useState<string | undefined>(editId);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(items.filter(isOpenOrder).map((order) => order.id))
  );

  const editOrder = useMemo(
    () => optimisticItems.find((item) => item.id === sheetEditId) ?? null,
    [optimisticItems, sheetEditId]
  );
  const editAllowed = editOrder ? canEditOrder(editOrder) : false;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return optimisticItems;
    return optimisticItems.filter((item) => {
      const hay = `${item.productName ?? ""} ${item.productCode ?? ""} ${item.taxonomyNodeName ?? ""} ${item.note ?? ""}`;
      return hay.toLowerCase().includes(q);
    });
  }, [optimisticItems, search]);

  const selectedOrders = useMemo(
    () =>
      filtered.filter(
        (order) => selectedIds.has(order.id) && isOpenOrder(order)
      ),
    [filtered, selectedIds]
  );

  const selectedTotal = selectedOrders.reduce(
    (sum, order) => sum + order.orderTotal,
    0
  );

  function setCreateOpen(open: boolean) {
    setSheetCreateOpen(open);
    if (open) {
      setSheetEditId(undefined);
      onSheetUrlChange?.({ create: true });
      return;
    }
    onSheetUrlChange?.({});
  }

  function setEditOpen(open: boolean, orderId?: string) {
    if (open && orderId) {
      setSheetCreateOpen(false);
      setSheetEditId(orderId);
      onSheetUrlChange?.({ edit: orderId });
      return;
    }
    setSheetEditId(undefined);
    onSheetUrlChange?.({});
  }

  function toggleSelected(orderId: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(orderId);
      else next.delete(orderId);
      return next;
    });
  }

  function handleCheckout() {
    if (selectedOrders.length === 0) return;
    const catalog = selectedOrders.find(
      (order) => order.kind === "CATALOG" && order.productId
    );
    const names = selectedOrders
      .map((order) => orderTitle(order, tOrders("customRequest")))
      .join(", ");
    const codes = selectedOrders
      .map((order) => order.productCode)
      .filter((code): code is string => Boolean(code))
      .join(", ");
    openInquiry({
      productId: catalog?.productId ?? null,
      productName: names,
      productCode: codes || null,
    });
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

      {optimisticItems.length === 0 ? (
        <AccountEmptyState
          icon={LuShoppingCart}
          title={t("ordersEmptyTitle")}
          description={t("ordersEmptyDesc")}
          actionLabel={t("browseCatalog")}
        />
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("ordersEmptyTitle")}</p>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div
            role="listbox"
            aria-multiselectable="true"
            aria-label={t("orders")}
            className="grid gap-3"
          >
            {filtered.map((order) => {
              const title = orderTitle(order, tOrders("customRequest"));
              const selectable = isOpenOrder(order);
              return (
                <AccountOrderLine
                  key={order.id}
                  id={order.id}
                  title={title}
                  href={
                    order.productId ? `/products/${order.productId}` : null
                  }
                  productId={order.productId}
                  productImage={order.productImage}
                  productCode={order.productCode}
                  kindLabel={
                    order.kind === "REQUEST"
                      ? tOrders("kindRequest")
                      : tOrders("kindCatalog")
                  }
                  status={order.status}
                  statusLabel={
                    order.status === "IN_PROGRESS"
                      ? tOrders("statusInProgress")
                      : order.status === "CLOSED"
                        ? tOrders("statusClosed")
                        : tOrders("statusNew")
                  }
                  priceLabel={formatCurrency(order.orderTotal, locale)}
                  selected={selectedIds.has(order.id)}
                  selectable={selectable}
                  onSelectedChange={(checked) =>
                    toggleSelected(order.id, checked)
                  }
                  canEdit={canEditOrder(order)}
                  onEdit={() => setEditOpen(true, order.id)}
                  onDelete={() => {
                    setSelectedIds((prev) => {
                      const next = new Set(prev);
                      next.delete(order.id);
                      return next;
                    });
                    removeOptimistically(order.id, () =>
                      deleteUserOrderAction({ orderId: order.id })
                    );
                  }}
                  favoriteId={order.favoriteId}
                  showFavorite={Boolean(order.productId)}
                />
              );
            })}
          </div>

          <AccountOrdersSummary
            className="lg:sticky lg:top-24"
            selectedCount={selectedOrders.length}
            totalLabel={formatCurrency(selectedTotal, locale)}
            onCheckout={handleCheckout}
          />
        </div>
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
