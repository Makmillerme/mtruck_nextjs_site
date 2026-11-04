"use client";

import { useMemo, useState } from "react";
import AccountOrderLine from "@/components/account/account-order-line";
import AccountOrdersSummary from "@/components/account/account-orders-summary";

const DEMO_LINES = [
  {
    id: "lab-order-1",
    title: "Volvo FH16",
    href: "/products",
    productId: "lab-product-1",
    productImage: null as string | null,
    productCode: "VH-1845",
    kindLabel: "З каталогу",
    status: "NEW" as const,
    statusLabel: "Нове",
    priceLabel: "84 500,00 USD",
    price: 84500,
    selectable: true,
    canEdit: true,
  },
  {
    id: "lab-order-2",
    title: "Scania R500",
    href: "/products",
    productId: "lab-product-2",
    productImage: null as string | null,
    productCode: "SR-500",
    kindLabel: "З каталогу",
    status: "IN_PROGRESS" as const,
    statusLabel: "В роботі",
    priceLabel: "72 100,00 USD",
    price: 72100,
    selectable: true,
    canEdit: false,
  },
  {
    id: "lab-order-3",
    title: "Індивідуальний запит · Тягачі",
    href: null,
    productId: null,
    productImage: null as string | null,
    productCode: null,
    kindLabel: "Під запит",
    status: "CLOSED" as const,
    statusLabel: "Закрито",
    priceLabel: "0,00 USD",
    price: 0,
    selectable: false,
    canEdit: false,
  },
];

export default function UiLabAccountOrders() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(["lab-order-1", "lab-order-2"])
  );

  const selected = useMemo(
    () => DEMO_LINES.filter((line) => selectedIds.has(line.id)),
    [selectedIds]
  );
  const total = selected.reduce((sum, line) => sum + line.price, 0);
  const totalLabel = new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(total);

  return (
    <div className="grid gap-8">
      <p className="max-w-2xl text-sm text-muted-foreground">
        Канон кабінету «Замовлення»: клік по картці вибирає (рамка + тінь), фото + статус +
        дії, sticky підсумок справа. Без qty / бонусів / зеленого retail.
      </p>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div role="listbox" aria-multiselectable="true" className="grid gap-3">
          {DEMO_LINES.map((line) => (
            <AccountOrderLine
              key={line.id}
              id={line.id}
              title={line.title}
              href={line.href}
              productId={line.productId}
              productImage={line.productImage}
              productCode={line.productCode}
              kindLabel={line.kindLabel}
              status={line.status}
              statusLabel={line.statusLabel}
              priceLabel={line.priceLabel}
              selected={selectedIds.has(line.id)}
              selectable={line.selectable}
              onSelectedChange={(checked) => {
                setSelectedIds((prev) => {
                  const next = new Set(prev);
                  if (checked) next.add(line.id);
                  else next.delete(line.id);
                  return next;
                });
              }}
              canEdit={line.canEdit}
              onEdit={line.canEdit ? () => undefined : undefined}
              onDelete={line.canEdit ? () => undefined : undefined}
              showFavorite={false}
            />
          ))}
        </div>

        <AccountOrdersSummary
          className="lg:sticky lg:top-24"
          selectedCount={selected.length}
          totalLabel={totalLabel}
          onCheckout={() => undefined}
        />
      </div>

      <div className="grid max-w-sm gap-2">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Summary · none selected
        </p>
        <AccountOrdersSummary
          selectedCount={0}
          totalLabel={new Intl.NumberFormat("uk-UA", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
          }).format(0)}
          onCheckout={() => undefined}
        />
      </div>
    </div>
  );
}
