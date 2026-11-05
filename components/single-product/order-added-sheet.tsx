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
import { Link, usePathname } from "@/i18n/navigation";
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
import {
  createCatalogOrderAction,
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
};

type OpenOrderSheetOptions = {
  onCreated?: () => void;
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

  // Layout host survives soft-refresh; close only on real route change (skip mount).
  useEffect(() => {
    if (pathnameRef.current === pathname) return;
    pathnameRef.current = pathname;
    setOpen(false);
    setProduct(null);
    setMode("confirm");
    onCreatedRef.current = null;
  }, [pathname]);

  const openSheet = useCallback(
    (
      next: OrderConfirmProductSummary,
      nextMode: OrderSheetMode = "confirm",
      options?: OpenOrderSheetOptions
    ) => {
      onCreatedRef.current = options?.onCreated ?? null;
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
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: OrderConfirmProductSummary;
  mode?: OrderSheetMode;
  onCreated?: () => void;
}) {
  const t = useTranslations("Product");
  const isOrdered = mode === "ordered";
  const allowsQuantity = Boolean(product.allowsQuantity);
  const isLabDemo = product.productId.startsWith("demo-");

  const [quantity, setQuantity] = useState(() =>
    Math.max(1, product.quantity ?? 1)
  );
  const [orderId, setOrderId] = useState<string | null>(
    product.orderId ?? null
  );

  useEffect(() => {
    if (!open) return;
    setQuantity(Math.max(1, product.quantity ?? 1));
    setOrderId(product.orderId ?? null);
  }, [open, product.productId, product.quantity, product.orderId]);

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
      <SheetContent side="right" className="flex w-full flex-col">
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
            canDelete={false}
            showFavorite={false}
          />

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {actions}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
