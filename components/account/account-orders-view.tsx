"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import AccountEmptyState from "@/components/account/AccountEmptyState";
import AccountOrderLine from "@/components/account/account-order-line";
import AccountOrdersSummary from "@/components/account/account-orders-summary";
import AdminListToolbar from "@/components/admin/admin-list-toolbar";
import { useCtaInquiry } from "@/components/cta/cta-inquiry";
import { SubmitButton } from "@/components/form/Buttons";
import { ConfirmDeleteCallbackIcon } from "@/components/form/ConfirmDelete";
import FormContainer from "@/components/form/FormContainer";
import { useOptimisticListRemove } from "@/lib/admin/optimistic-list";
import { useRouter } from "@/i18n/navigation";
import { notify } from "@/lib/ui/notify";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ORDER_QUANTITY_MAX } from "@/lib/catalog/order-quantity";
import {
  createUserRequestOrderAction,
  deleteAllDeletableUserOrdersAction,
  deleteUserOrderAction,
  updateCatalogOrderQuantityAction,
} from "@/utils/actions";
import { formatCurrency } from "@/utils/format";
import { LuShoppingCart } from "react-icons/lu";

type QtyPatch = { quantity: number; orderTotal: number };

const QTY_PERSIST_MS = 280;

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
  quantity: number;
  allowsQuantity: boolean;
  createdAt: string;
};

function canDeleteOrder(order: AccountOrderRow) {
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
  note,
  noteRequired = false,
}: {
  note?: string | null;
  noteRequired?: boolean;
}) {
  const t = useTranslations("AccountCabinet");

  return (
    <div className="grid gap-2">
      <Label htmlFor="note">{t("orderNote")}</Label>
      <Textarea
        id="note"
        name="note"
        rows={5}
        required={noteRequired}
        minLength={noteRequired ? 10 : undefined}
        defaultValue={note ?? ""}
        placeholder={t("orderNotePlaceholder")}
        className="leading-loose"
      />
    </div>
  );
}

export default function AccountOrdersView({
  items,
  locale,
  createOpen,
  userPhone = null,
  onSheetUrlChange,
}: {
  items: AccountOrderRow[];
  locale: string;
  createOpen: boolean;
  /** Profile phone — if missing, request modal asks for it once. */
  userPhone?: string | null;
  /** Sync create query without RSC (cabinet uses replaceState). */
  onSheetUrlChange?: (next: { create?: boolean }) => void;
}) {
  const t = useTranslations("AccountCabinet");
  const tOrders = useTranslations("Orders");
  const router = useRouter();
  const { open: openInquiry } = useCtaInquiry();
  const { optimisticItems, removeOptimistically } =
    useOptimisticListRemove(items);
  const [search, setSearch] = useState("");
  const [requestOpen, setRequestOpen] = useState(createOpen);
  const needsPhone = !userPhone?.trim();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(items.filter(isOpenOrder).map((order) => order.id))
  );
  const [qtyPatch, setQtyPatch] = useState<Record<string, QtyPatch>>({});
  const qtyTimersRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const qtyLatestRef = useRef(new Map<string, number>());
  const unitPriceRef = useRef(new Map<string, number>());
  const qtyRequestGenRef = useRef(new Map<string, number>());

  // Soft-reconcile only: drop patch when server caught up to latest desired qty.
  // Never wipe all patches — that flashes an intermediate number while clicking.
  useEffect(() => {
    setQtyPatch((prev) => {
      let changed = false;
      const next = { ...prev };
      const ids = new Set(items.map((order) => order.id));
      for (const order of items) {
        const patch = next[order.id];
        if (!patch) continue;
        const latest = qtyLatestRef.current.get(order.id) ?? patch.quantity;
        if (order.quantity === latest) {
          delete next[order.id];
          changed = true;
        }
      }
      for (const id of Object.keys(next)) {
        if (!ids.has(id)) {
          delete next[id];
          qtyLatestRef.current.delete(id);
          unitPriceRef.current.delete(id);
          qtyRequestGenRef.current.delete(id);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [items]);

  useEffect(() => {
    const timers = qtyTimersRef.current;
    return () => {
      for (const timer of timers.values()) clearTimeout(timer);
      timers.clear();
    };
  }, []);

  const displayItems = useMemo(
    () =>
      optimisticItems.map((order) => {
        const patch = qtyPatch[order.id];
        return patch ? { ...order, ...patch } : order;
      }),
    [optimisticItems, qtyPatch]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return displayItems;
    return displayItems.filter((item) => {
      const hay = `${item.productName ?? ""} ${item.productCode ?? ""} ${item.taxonomyNodeName ?? ""} ${item.note ?? ""}`;
      return hay.toLowerCase().includes(q);
    });
  }, [displayItems, search]);

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

  const deletableOrders = useMemo(
    () => displayItems.filter(canDeleteOrder),
    [displayItems]
  );

  function setRequestOpenState(open: boolean) {
    setRequestOpen(open);
    onSheetUrlChange?.(open ? { create: true } : {});
  }

  function onRequestSuccess() {
    setRequestOpenState(false);
    router.refresh();
  }

  function toggleSelected(orderId: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(orderId);
      else next.delete(orderId);
      return next;
    });
  }

  function persistQuantity(orderId: string, quantity: number) {
    qtyLatestRef.current.set(orderId, quantity);
    const prevTimer = qtyTimersRef.current.get(orderId);
    if (prevTimer) clearTimeout(prevTimer);
    const timer = setTimeout(() => {
      qtyTimersRef.current.delete(orderId);
      const latest = qtyLatestRef.current.get(orderId);
      if (latest == null) return;
      const gen = (qtyRequestGenRef.current.get(orderId) ?? 0) + 1;
      qtyRequestGenRef.current.set(orderId, gen);
      const formData = new FormData();
      formData.set("orderId", orderId);
      formData.set("quantity", String(latest));
      void updateCatalogOrderQuantityAction(
        { message: "", ok: true },
        formData
      ).then((result) => {
        if (qtyRequestGenRef.current.get(orderId) !== gen) return;
        if (qtyLatestRef.current.get(orderId) !== latest) return;
        if (result.message) notify.fromAction(result);
        if (result.ok === false) {
          setQtyPatch((prev) => {
            const next = { ...prev };
            delete next[orderId];
            return next;
          });
          qtyLatestRef.current.delete(orderId);
          unitPriceRef.current.delete(orderId);
          router.refresh();
        }
      });
    }, QTY_PERSIST_MS);
    qtyTimersRef.current.set(orderId, timer);
  }

  function handleQuantityChange(order: AccountOrderRow, nextQty: number) {
    const quantity = Math.min(
      ORDER_QUANTITY_MAX,
      Math.max(1, Math.trunc(nextQty))
    );
    let unitPrice = unitPriceRef.current.get(order.id);
    if (unitPrice == null || !Number.isFinite(unitPrice)) {
      unitPrice =
        order.quantity > 0
          ? order.orderTotal / order.quantity
          : order.orderTotal;
      unitPriceRef.current.set(order.id, unitPrice);
    }
    setQtyPatch((prev) => ({
      ...prev,
      [order.id]: {
        quantity,
        orderTotal: unitPrice * quantity,
      },
    }));
    persistQuantity(order.id, quantity);
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
        onCreate={() => setRequestOpenState(true)}
      />

      <div className="flex flex-wrap items-center gap-x-1.5 text-sm text-muted-foreground">
        <p>{t("ordersTotal", { count: filtered.length })}</p>
        {deletableOrders.length > 0 ? (
          <>
            <span aria-hidden>·</span>
            <ConfirmDeleteCallbackIcon
              label={t("removeAllOrders")}
              title={t("removeAllOrdersTitle")}
              description={t("removeAllOrdersDescription")}
              confirmLabel={t("removeAllOrders")}
              className="h-auto cursor-pointer gap-1 px-0 py-0 text-sm font-normal text-muted-foreground hover:bg-transparent hover:text-foreground"
              iconClassName="size-3.5"
              onConfirm={async () => {
                const result = await deleteAllDeletableUserOrdersAction();
                if (result.message) notify.fromAction(result);
                if (result.ok) {
                  setSelectedIds(new Set());
                  setQtyPatch({});
                  router.refresh();
                }
              }}
            />
          </>
        ) : null}
      </div>

      {displayItems.length === 0 ? (
        <AccountEmptyState
          icon={LuShoppingCart}
          title={t("ordersEmptyTitle")}
          description={t("ordersEmptyDesc")}
          actionLabel={t("browseCatalog")}
          secondaryActionLabel={t("emptyRequestAction")}
          onSecondaryAction={() => setRequestOpenState(true)}
        />
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("ordersEmptyTitle")}</p>
      ) : (
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div
            role="listbox"
            aria-multiselectable="true"
            aria-label={t("orders")}
            className="grid w-full min-w-0 gap-3"
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
                  note={order.kind === "REQUEST" ? order.note : null}
                  priceLabel={
                    order.kind === "REQUEST" && order.orderTotal <= 0
                      ? t("requestPricePending")
                      : formatCurrency(order.orderTotal, locale)
                  }
                  quantity={order.quantity}
                  allowsQuantity={order.allowsQuantity}
                  quantityMax={ORDER_QUANTITY_MAX}
                  onQuantityChange={
                    order.allowsQuantity
                      ? (next) => handleQuantityChange(order, next)
                      : undefined
                  }
                  selected={selectedIds.has(order.id)}
                  selectable={selectable}
                  onSelectedChange={(checked) =>
                    toggleSelected(order.id, checked)
                  }
                  canDelete={canDeleteOrder(order)}
                  onDelete={
                    canDeleteOrder(order)
                      ? () => {
                          setSelectedIds((prev) => {
                            const next = new Set(prev);
                            next.delete(order.id);
                            return next;
                          });
                          removeOptimistically(order.id, () =>
                            deleteUserOrderAction({ orderId: order.id })
                          );
                        }
                      : undefined
                  }
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

      <Dialog open={requestOpen} onOpenChange={setRequestOpenState}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("createOrderSheetTitle")}</DialogTitle>
            <DialogDescription>{t("createOrderSheetLede")}</DialogDescription>
          </DialogHeader>
          <FormContainer
            key={requestOpen ? "request-open" : "request-closed"}
            action={createUserRequestOrderAction}
            onSuccess={onRequestSuccess}
            className="grid gap-4"
          >
            {needsPhone ? (
              <div className="grid gap-2">
                <Label htmlFor="request-phone">{t("phoneLabel")}</Label>
                <Input
                  id="request-phone"
                  name="phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder={t("requestPhonePlaceholder")}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  {t("requestPhoneHint")}
                </p>
              </div>
            ) : null}
            <OrderRequestFields noteRequired />
            <DialogFooter>
              <SubmitButton
                text={t("submitCreateOrder")}
                className="w-full sm:w-auto"
              />
            </DialogFooter>
          </FormContainer>
        </DialogContent>
      </Dialog>
    </section>
  );
}
