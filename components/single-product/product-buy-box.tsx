import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

export default function ProductBuyBox({
  categoryLabel,
  name,
  priceLabel,
  availabilityLabel,
  availabilityInStock,
  actions,
  cta,
  sticky = false,
}: {
  categoryLabel?: string | null;
  name: string;
  priceLabel: string;
  availabilityLabel: string;
  availabilityInStock: boolean;
  actions?: ReactNode;
  cta?: ReactNode;
  /** When true, box sticks under header on desktop. */
  sticky?: boolean;
}) {
  return (
    <div
      className={
        sticky
          ? "grid gap-5 content-start lg:sticky lg:top-24"
          : "grid gap-5 content-start"
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 grid gap-2">
          {categoryLabel ? (
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              {categoryLabel}
            </p>
          ) : null}
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {name}
          </h1>
        </div>
        {actions ? (
          <div className="flex items-center gap-2">{actions}</div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={availabilityInStock ? "default" : "secondary"}>
          {availabilityLabel}
        </Badge>
      </div>

      <p className="text-3xl font-extrabold tracking-tight text-foreground">
        {priceLabel}
      </p>

      {cta ? <div className="grid gap-3">{cta}</div> : null}
    </div>
  );
}
