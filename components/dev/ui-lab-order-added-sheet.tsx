"use client";

import { useState } from "react";
import OrderAddedSheet, {
  type OrderConfirmProductSummary,
  type OrderSheetMode,
} from "@/components/single-product/order-added-sheet";
import { Button } from "@/components/ui/button";

const DEMO_PRODUCT: OrderConfirmProductSummary = {
  productId: "demo-man-tgx",
  name: "MAN TGX 18.510 4x2 BLS EfficientLine 3",
  priceLabel: "84 500,00 USD",
  imageSrc: "/images/hero.webp",
  productCode: "MT-18510",
  allowsQuantity: true,
  quantity: 1,
};

export default function UiLabOrderAddedSheetDemo() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<OrderSheetMode>("confirm");

  function openDemo(nextMode: OrderSheetMode) {
    setMode(nextMode);
    setOpen(true);
  }

  return (
    <div className="grid max-w-xl gap-3">
      <p className="max-w-2xl text-sm text-muted-foreground">
        Картка = канон AccountOrderLine (секція account-orders), не каталожна grid-картка.
        Confirm: Скасувати | Створити під карткою. Ordered: Усі | Оформити + в картці
        «В обрані» / «Видалити» (і qty-степпер якщо allowsQuantity).
      </p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" className="w-fit" onClick={() => openDemo("confirm")}>
          Демо confirm
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-fit"
          onClick={() => openDemo("ordered")}
        >
          Демо ordered
        </Button>
      </div>
      <OrderAddedSheet
        open={open}
        mode={mode}
        onOpenChange={setOpen}
        product={DEMO_PRODUCT}
        onCreated={() => setMode("ordered")}
      />
    </div>
  );
}
