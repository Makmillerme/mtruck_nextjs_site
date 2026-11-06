"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useFormStatus } from "react-dom";
import { ReloadIcon } from "@radix-ui/react-icons";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import AccountOrderLine from "@/components/account/account-order-line";
import FormContainer from "@/components/form/FormContainer";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ORDER_QUANTITY_MAX } from "@/lib/catalog/order-quantity";
import { notify } from "@/lib/ui/notify";
import {
  createCatalogOrderAction,
  deleteUserOrderAction,
  updateCatalogOrderQuantityAction,
} from "@/utils/actions";
import type { ActionState } from "@/utils/types";
import { useTranslations } from "next-intl";

export type OrderSheetMode = "confirm" | "ordered";

/** Same surface as AccountOrderLine (UI Lab → account-orders). */
export type OrderConfirmProductSummary = {
  productId: string;
  name: string;
  priceLabel: string;
  imageSrc?: string | null;
  productCode?: string | null;
  /** Root productsAreUnique === false → show qty stepper. */
  allowsQuantity?: boolean;
  /** Open catalog order id when mode is ordered. */
  orderId?: string | null;
  quantity?: number;
  favoriteId?: string | null;
};

type OpenOrderSheetOptions = {
  onCreated?: () => void;
  /** After user deletes the NEW order from the sheet. */
  onDeleted?: () => void;
};

type OrderAddedSheetApi = {
  open: (
    product: OrderConfirmProductSummary,
    mode?: OrderSheetMode,
    options?: OpenOrderSheetOptions
  ) => void;
  close: () => void;
};

const OrderAddedSheetContext = createContext<OrderAddedSheetApi | null>(null);

export function useOrderAddedSheet() {
  const api = useContext(OrderAddedSheetContext);
  if (!api) {
    throw new Error("useOrderAddedSheet must be used within OrderAddedSheetProvider");
  }
  return api;
}

/** Layout-stable host — survives PDP soft-refresh after Server Action. */
export function OrderAddedSheetProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<OrderSheetMode>("confirm");
  const [product, setProduct] = useState<OrderConfirmProductSummary | null>(null);
  const onCreatedRef = useRef<(() => void) | null>(null);
  const onDeletedRef = useRef<(() => void) | null>(null);

  // Layout host survives soft-refresh; close only on real route change (skip mount).
  useEffect(() => {
    if (pathnameRef.current === pathname) return;
    pathnameRef.current = pathname;
    setOpen(false);
    setProduct(null);
    setMode("confirm");
    onCreatedRef.current = null;
    onDeletedRef.current = null;
  }, [pathname]);

  const openSheet = useCallback(
    (
      next: OrderConfirmProductSummary,
      nextMode: OrderSheetMode = "confirm",
      options?: OpenOrderSheetOptions
    ) => {
      onCreatedRef.current = options?.onCreated ?? null;
      onDeletedRef.current = options?.onDeleted ?? null;
      setProduct(next);
      setMode(nextMode);
      setOpen(true);
    },
    []
  );

  const closeSheet = useCallback(() => {
    setOpen(false);
  }, []);

  const api = useMemo(
    () => ({ open: openSheet, close: closeSheet }),
    [openSheet, closeSheet]
  );

  function onCreated() {
    setMode("ordered");
    onCreatedRef.current?.();
  }

  function onDeleted() {
    setMode("confirm");
    onDeletedRef.current?.();
  }

  return (
    <OrderAddedSheetContext.Provider value={api}>
      {children}
      <OrderAddedSheet
        open={open}
        mode={mode}
        product={
          product ?? {
            productId: "",
            name: "",
            priceLabel: "",
          }
        }
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setProduct(null);
            setMode("confirm");
          }
        }}
        onCreated={onCreated}
        onDeleted={onDeleted}
      />
    </OrderAddedSheetContext.Provider>
  );
}

function CreateOrderSubmit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  const t = useTranslations("Common");
  return (
    <Button type="submit" size="default" className="w-full sm:w-auto" disabled={pending}>
      {pending ? (
        <>
          <ReloadIcon className="size-4 animate-spin" aria-hidden />
          {t("pleaseWait")}
        </>
      ) : (
        label
      )}
    </Button>
  );
}

export default function OrderAddedSheet({
  open,
  onOpenChange,
  product,
  mode = "confirm",
  onCreated,
  onDeleted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: OrderConfirmProductSummary;
  mode?: OrderSheetMode;
  onCreated?: () => void;
  onDeleted?: () => void;
}) {
  const t = useTranslations("Product");
  const router = useRouter();
  const isOrdered = mode === "ordered";
  const allowsQuantity = Boolean(product.allowsQuantity);
  const isLabDemo = product.productId.startsWith("demo-");

  const [quantity, setQuantity] = useState(() =>
    Math.max(1, product.quantity ?? 1)
  );
  const [orderId, setOrderId] = useState<string | null>(
    product.orderId ?? null
  );
  const [favoriteId, setFavoriteId] = useState<string | null>(
    product.favoriteId ?? null
  );

  useEffect(() => {
    if (!open) return;
    setQuantity(Math.max(1, product.quantity ?? 1));
    setOrderId(product.orderId ?? null);
    setFavoriteId(product.favoriteId ?? null);
  }, [
    open,
    product.productId,
    product.quantity,
    product.orderId,
    product.favoriteId,
  ]);

  const title = isOrdered ? t("orderInCartTitle") : t("orderConfirmTitle");

  function handleCreated(state: ActionState) {
    if (state.orderId) setOrderId(state.orderId);
    onCreated?.();
  }

  function handleQuantityChange(next: number) {
    const clamped = Math.min(ORDER_QUANTITY_MAX, Math.max(1, next));
    setQuantity(clamped);
    if (!isOrdered || !orderId || isLabDemo) return;
    const formData = new FormData();
    formData.set("orderId", orderId);
    formData.set("quantity", String(clamped));
    void updateCatalogOrderQuantityAction({ message: "", ok: true }, formData);
  }

  function handleDelete() {
    if (isLabDemo || !orderId) {
      setOrderId(null);
      onDeleted?.();
      onOpenChange(false);
      return;
    }
    void deleteUserOrderAction({ orderId }).then((result) => {
      if (result.message) notify.fromAction(result);
      if (!result.ok) return;
      setOrderId(null);
      document.cookie =
        "mtruck-order-added=; Path=/; Max-Age=0; SameSite=Lax";
      onDeleted?.();
      onOpenChange(false);
      router.refresh();
    });
  }

  const actions = isOrdered ? (
    <>
      <Button asChild type="button" variant="outline" size="default" className="w-full sm:w-auto">
        <Link
          href="/account?tab=orders"
          onClick={() => onOpenChange(false)}
        >
          {t("allOrders")}
        </Link>
      </Button>
      <Button asChild size="default" className="w-full sm:w-auto">
        <Link
          href="/account?tab=orders"
          onClick={() => onOpenChange(false)}
        >
          {t("checkoutOrder")}
        </Link>
      </Button>
    </>
  ) : (
    <>
      <Button
        type="button"
        variant="outline"
        size="default"
        className="w-full sm:w-auto"
        onClick={() => onOpenChange(false)}
      >
        {t("orderAddedCancel")}
      </Button>
      {isLabDemo ? (
        <Button
          type="button"
          size="default"
          className="w-full sm:w-auto"
          onClick={() => handleCreated({ message: "", ok: true })}
        >
          {t("createOrder")}
        </Button>
      ) : (
        <FormContainer
          action={createCatalogOrderAction}
          className="w-full sm:w-auto"
          onSuccess={handleCreated}
        >
          <input type="hidden" name="productId" value={product.productId} />
          <input type="hidden" name="quantity" value={quantity} />
          <CreateOrderSubmit label={t("createOrder")} />
        </FormContainer>
      )}
    </>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>

        <div className="grid gap-4">
          {/* Canon: same card as /account?tab=orders (UI Lab → account-orders). */}
          <AccountOrderLine
            id={orderId ?? `sheet-${product.productId || "product"}`}
            title={product.name}
            href={
              isLabDemo || !product.productId
                ? null
                : `/products/${product.productId}`
            }
            productId={product.productId || null}
            productImage={product.imageSrc}
            productCode={product.productCode}
            priceLabel={product.priceLabel}
            quantity={quantity}
            allowsQuantity={allowsQuantity}
            quantityMax={ORDER_QUANTITY_MAX}
            onQuantityChange={
              allowsQuantity ? handleQuantityChange : undefined
            }
            selected={false}
            selectable={false}
            onSelectedChange={() => {}}
            canDelete={isOrdered}
            onDelete={isOrdered ? handleDelete : undefined}
            favoriteId={favoriteId}
            showFavorite={isOrdered && Boolean(product.productId)}
            onFavoriteChange={setFavoriteId}
          />

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {actions}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
