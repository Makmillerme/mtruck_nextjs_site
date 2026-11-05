"use client";

import { useMemo, useState } from "react";
import AccountOrderLine from "@/components/account/account-order-line";
import AccountOrdersSummary from "@/components/account/account-orders-summary";
import { cn } from "@/lib/utils";

type DemoLine = {
  id: string;
  title: string;
  href: string | null;
  productId: string | null;
  productImage: string | null;
  productCode: string | null;
  note: string | null;
  unitPrice: number;
  quantity: number;
  allowsQuantity: boolean;
  pendingLabel?: string;
  selectable: boolean;
  canDelete: boolean;
};

const INITIAL_DEMO_LINES: DemoLine[] = [
  {
    id: "lab-order-1",
    title: "Volvo FH16",
    href: "/products",
    productId: "lab-product-1",
    productImage: null,
    productCode: "VH-1845",
    note: null,
    unitPrice: 84500,
    quantity: 2,
    allowsQuantity: true,
    selectable: true,
    canDelete: true,
  },
  {
    id: "lab-order-2",
    title: "Scania R500",
    href: "/products",
    productId: "lab-product-2",
    productImage: null,
    productCode: "SR-500",
    note: null,
    unitPrice: 72100,
    quantity: 1,
    allowsQuantity: false,
    selectable: true,
    canDelete: false,
  },
  {
    id: "lab-order-3",
    title: "Індивідуальний запит · Тягачі",
    href: null,
    productId: null,
    productImage: null,
    productCode: null,
    note: "Volvo FH або подібний, 2020+, бюджет до 80k USD",
    unitPrice: 0,
    quantity: 1,
    allowsQuantity: false,
    pendingLabel: "Під запит",
    selectable: true,
    canDelete: true,
  },
  {
    id: "lab-order-4",
    title: "Індивідуальний запит · Самоскиди",
    href: null,
    productId: null,
    productImage: null,
    productCode: null,
    note: null,
    unitPrice: 0,
    quantity: 1,
    allowsQuantity: false,
    pendingLabel: "Під запит",
    selectable: false,
    canDelete: false,
  },
];

function money(amount: number) {
  return new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

function OrdersCanonLayout({
  lines,
  selectedIds,
  onSelectedChange,
  onQuantityChange,
  className,
}: {
  lines: DemoLine[];
  selectedIds: Set<string>;
  onSelectedChange: (id: string, checked: boolean) => void;
  onQuantityChange: (id: string, next: number) => void;
  className?: string;
}) {
  const selected = useMemo(
    () => lines.filter((line) => selectedIds.has(line.id)),
    [lines, selectedIds]
  );
  const total = selected.reduce(
    (sum, line) => sum + line.unitPrice * line.quantity,
    0
  );

  return (
    <div
      className={cn(
        "grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]",
        className
      )}
    >
      <div
        role="listbox"
        aria-multiselectable="true"
        className="grid w-full min-w-0 gap-3"
      >
        {lines.map((line) => (
          <AccountOrderLine
            key={line.id}
            id={line.id}
            title={line.title}
            href={line.href}
            productId={line.productId}
            productImage={line.productImage}
            productCode={line.productCode}
            note={line.note}
            priceLabel={
              line.pendingLabel ?? money(line.unitPrice * line.quantity)
            }
            quantity={line.quantity}
            allowsQuantity={line.allowsQuantity}
            onQuantityChange={
              line.allowsQuantity
                ? (next) => onQuantityChange(line.id, next)
                : undefined
            }
            selected={selectedIds.has(line.id)}
            selectable={line.selectable}
            onSelectedChange={(checked) => onSelectedChange(line.id, checked)}
            canDelete={line.canDelete}
            onDelete={line.canDelete ? () => undefined : undefined}
            showFavorite={Boolean(line.productId)}
          />
        ))}
      </div>

      <AccountOrdersSummary
        className="lg:sticky lg:top-24"
        selectedCount={selected.length}
        totalLabel={money(total)}
        onCheckout={() => undefined}
      />
    </div>
  );
}

export default function UiLabAccountOrders() {
  const [lines, setLines] = useState(INITIAL_DEMO_LINES);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(["lab-order-1", "lab-order-2", "lab-order-3"])
  );

  function onSelectedChange(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function onQuantityChange(id: string, next: number) {
    setLines((prev) =>
      prev.map((line) =>
        line.id === id ? { ...line, quantity: next } : line
      )
    );
  }

  return (
    <div className="grid gap-10">
      <p className="max-w-2xl text-sm text-muted-foreground">
        Канон кошика «Замовлення»: qty-stepper лише коли root-гілка не
        «унікальна» (демо: Volvo з qty, Scania без). Утримання +/- ≈420 мс →
        автоповтор. До lg — квадратне фото; від lg — альбом 4:3 + sticky сайдбар.
      </p>

      <div className="grid gap-3">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Desktop · full (lg+ row + sidebar)
        </p>
        <OrdersCanonLayout
          lines={lines}
          selectedIds={selectedIds}
          onSelectedChange={onSelectedChange}
          onQuantityChange={onQuantityChange}
        />
      </div>

      <div className="grid gap-3">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Tablet sim · max-w-3xl (COMFY stack + sidebar)
        </p>
        <div className="max-w-3xl overflow-hidden rounded-sm border border-dashed border-border p-3 sm:p-4">
          <OrdersCanonLayout
            lines={lines}
            selectedIds={selectedIds}
            onSelectedChange={onSelectedChange}
            onQuantityChange={onQuantityChange}
          />
        </div>
      </div>

      <div className="grid gap-3">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Phone sim · max-w-[24rem] (COMFY stack)
        </p>
        <div className="max-w-[24rem] overflow-hidden rounded-sm border border-dashed border-border p-3">
          <OrdersCanonLayout
            lines={lines}
            selectedIds={selectedIds}
            onSelectedChange={onSelectedChange}
            onQuantityChange={onQuantityChange}
          />
        </div>
      </div>

      <div className="grid max-w-sm gap-2">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Summary · none selected
        </p>
        <AccountOrdersSummary
          selectedCount={0}
          totalLabel={money(0)}
          onCheckout={() => undefined}
        />
      </div>
    </div>
  );
}
