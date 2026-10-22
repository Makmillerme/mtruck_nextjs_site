import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import ProductKeyFacts from "@/components/single-product/product-key-facts";
import type { ProductKeyFact } from "@/lib/catalog/product-page";
import { cn } from "@/lib/utils";

export default function ProductBuyBox({
  categoryLabel,
  name,
  priceLabel,
  priceHint,
  availabilityLabel,
  availabilityInStock,
  facts = [],
  actions,
  cta,
  secondaryCta,
}: {
  categoryLabel?: string | null;
  name: string;
  priceLabel: string;
  priceHint?: string;
  availabilityLabel: string;
  availabilityInStock: boolean;
  facts?: ProductKeyFact[];
  actions?: ReactNode;
  cta?: ReactNode;
  secondaryCta?: ReactNode;
}) {
  return (
    <div className="grid gap-5 content-start">
      <div className="grid gap-2">
        {categoryLabel ? (
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            {categoryLabel}
          </p>
        ) : null}
        <h1 className="text-3xl font-bold tracking-tight text-foreground lg:text-[2rem] lg:leading-tight">
          {name}
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={availabilityInStock ? "default" : "secondary"}>
          {availabilityLabel}
        </Badge>
        {actions ? (
          <div className="ml-auto flex items-center gap-2">{actions}</div>
        ) : null}
      </div>

      {facts.length > 0 ? (
        <ProductKeyFacts facts={facts} variant="compact" />
      ) : null}

      <div className="grid gap-1">
        <p className="text-3xl font-extrabold tracking-tight text-foreground">
          {priceLabel}
        </p>
        {priceHint ? (
          <p className="text-xs text-muted-foreground">{priceHint}</p>
        ) : null}
      </div>

      {cta || secondaryCta ? (
        <div
          className={cn(
            "flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center"
          )}
        >
          {cta}
          {secondaryCta}
        </div>
      ) : null}
    </div>
  );
}
