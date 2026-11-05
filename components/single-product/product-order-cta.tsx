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
import { ProductSignInButton } from "@/components/form/Buttons";
import { Button } from "@/components/ui/button";
import {
  useOrderAddedSheet,
  type OrderConfirmProductSummary,
  type OrderSheetMode,
} from "@/components/single-product/order-added-sheet";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { LuArrowRight, LuShoppingCart } from "react-icons/lu";

type CatalogOrderUi = {
  isAuthenticated: boolean;
  hasOpenOrder: boolean;
  justAdded: boolean;
  openSheet: (mode?: OrderSheetMode) => void;
};

const CatalogOrderUiContext = createContext<CatalogOrderUi | null>(null);

function useCatalogOrderUi() {
  const ctx = useContext(CatalogOrderUiContext);
  if (!ctx) {
    throw new Error("CatalogOrderTrigger must be used within CatalogOrderProvider");
  }
  return ctx;
}

export function CatalogOrderProvider({
  productId,
  productName,
  priceLabel,
  imageSrc,
  productCode,
  isAuthenticated,
  hasOpenOrder = false,
  openOrderId = null,
  openOrderQuantity = 1,
  allowsQuantity = false,
  initialSheetOpen = false,
  children,
}: {
  productId: string;
  productName: string;
  priceLabel: string;
  imageSrc?: string | null;
  productCode?: string | null;
  isAuthenticated: boolean;
  hasOpenOrder?: boolean;
  openOrderId?: string | null;
  openOrderQuantity?: number;
  /** Root productsAreUnique === false. */
  allowsQuantity?: boolean;
  /** Flash cookie after Server Action — reopen ordered sheet if remount wiped host. */
  initialSheetOpen?: boolean;
  children: ReactNode;
}) {
  const orderAddedSheet = useOrderAddedSheet();
  const [justAdded, setJustAdded] = useState(initialSheetOpen || hasOpenOrder);
  const restoredFlashRef = useRef(false);

  const summary = useMemo<OrderConfirmProductSummary>(
    () => ({
      productId,
      name: productName,
      priceLabel,
      imageSrc,
      productCode,
      allowsQuantity,
      orderId: openOrderId,
      quantity: openOrderQuantity,
    }),
    [
      productId,
      productName,
      priceLabel,
      imageSrc,
      productCode,
      allowsQuantity,
      openOrderId,
      openOrderQuantity,
    ]
  );

  const openSheet = useCallback(
    (mode?: OrderSheetMode) => {
      const nextMode =
        mode ?? (hasOpenOrder || justAdded ? "ordered" : "confirm");
      orderAddedSheet.open(summary, nextMode, {
        onCreated: () => setJustAdded(true),
      });
    },
    [orderAddedSheet, summary, hasOpenOrder, justAdded]
  );

  useEffect(() => {
    if (!initialSheetOpen || restoredFlashRef.current) return;
    restoredFlashRef.current = true;
    document.cookie = "mtruck-order-added=; Path=/; Max-Age=0; SameSite=Lax";
    setJustAdded(true);
    orderAddedSheet.open(summary, "ordered");
  }, [initialSheetOpen, orderAddedSheet, summary]);

  useEffect(() => {
    if (hasOpenOrder) setJustAdded(true);
  }, [hasOpenOrder]);

  const value = useMemo(
    () => ({
      isAuthenticated,
      hasOpenOrder,
      justAdded,
      openSheet,
    }),
    [isAuthenticated, hasOpenOrder, justAdded, openSheet]
  );

  return (
    <CatalogOrderUiContext.Provider value={value}>
      {children}
    </CatalogOrderUiContext.Provider>
  );
}

/** Buy-box / sticky CTA — opens layout sheet; never submits from PDP. */
export function CatalogOrderTrigger({ className }: { className?: string }) {
  const t = useTranslations("Product");
  const { isAuthenticated, hasOpenOrder, justAdded, openSheet } =
    useCatalogOrderUi();

  if (!isAuthenticated) {
    return <ProductSignInButton />;
  }

  const showCheckout = hasOpenOrder || justAdded;

  return (
    <Button
      type="button"
      size="lg"
      className={cn("w-full", className)}
      onClick={() => openSheet(showCheckout ? "ordered" : "confirm")}
    >
      {showCheckout ? (
        <>
          <LuArrowRight className="size-4" aria-hidden />
          {t("checkoutOrder")}
        </>
      ) : (
        <>
          <LuShoppingCart className="size-4" aria-hidden />
          {t("requestVehicle")}
        </>
      )}
    </Button>
  );
}

/** @deprecated Prefer CatalogOrderProvider + CatalogOrderTrigger */
export { CatalogOrderTrigger as default };
