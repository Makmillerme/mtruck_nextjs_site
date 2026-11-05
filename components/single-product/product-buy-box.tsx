import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import ProductKeyFacts from "@/components/single-product/product-key-facts";
import type { ProductKeyFact } from "@/lib/catalog/product-page";
import { cn } from "@/lib/utils";
import {
  LuBanknote,
  LuChevronRight,
  LuFileCheck,
  LuSparkles,
  LuTruck,
  LuWrench,
} from "react-icons/lu";

type TrustItem = {
  id: string;
  label: string;
  hint?: string;
  Icon: typeof LuTruck;
};

/** Order matches PDP trustItems: delivery → service → prep → documents. */
const TRUST_ICONS = [LuTruck, LuWrench, LuSparkles, LuFileCheck] as const;

export default function ProductBuyBox({
  categoryLabel,
  name,
  priceLabel,
  priceHint,
  availabilityLabel,
  availabilityInStock,
  facts = [],
  articleLabel,
  financingLabel,
  financingAmount,
  financingHint,
  trustItems = [],
  actions,
  cta,
  secondaryCta,
  className,
}: {
  categoryLabel?: string | null;
  name: string;
  priceLabel: string;
  priceHint?: string;
  availabilityLabel: string;
  availabilityInStock: boolean;
  facts?: ProductKeyFact[];
  articleLabel?: string | null;
  /** Static financing eyebrow, e.g. "Фінансування від". */
  financingLabel?: string | null;
  /** Static monthly amount, e.g. "≈ 1 420 USD/міс". */
  financingAmount?: string | null;
  /** Soft disclaimer (lease or credit). */
  financingHint?: string | null;
  trustItems?: { id: string; label: string; hint?: string }[];
  actions?: ReactNode;
  cta?: ReactNode;
  secondaryCta?: ReactNode;
  className?: string;
}) {
  const showFinancing = Boolean(financingLabel || financingAmount);
  const trust: TrustItem[] = trustItems.map((item, index) => ({
    ...item,
    Icon: TRUST_ICONS[index % TRUST_ICONS.length]!,
  }));

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <div className="grid shrink-0 gap-2">
        {categoryLabel ? (
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            {categoryLabel}
          </p>
        ) : null}

        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground lg:text-[2rem] lg:leading-tight">
              {name}
            </h1>
            <Badge
              variant={availabilityInStock ? "default" : "secondary"}
              className="shrink-0"
            >
              {availabilityLabel}
            </Badge>
          </div>
          {(articleLabel || actions) && (
            <div className="flex shrink-0 items-center gap-2 pt-1">
              {articleLabel ? (
                <p className="hidden font-mono text-[11px] tracking-[0.04em] text-muted-foreground sm:block">
                  {articleLabel}
                </p>
              ) : null}
              {actions}
            </div>
          )}
        </div>
        {articleLabel ? (
          <p className="font-mono text-[11px] tracking-[0.04em] text-muted-foreground sm:hidden">
            {articleLabel}
          </p>
        ) : null}
      </div>

      {facts.length > 0 ? (
        <div className="shrink-0">
          <ProductKeyFacts facts={facts} variant="compact" />
        </div>
      ) : null}

      <div className="grid shrink-0 gap-5">
        <div
          className={cn(
            "grid gap-4 rounded-sm border border-border bg-card p-4",
            showFinancing &&
              "sm:grid-cols-2 sm:gap-0 sm:divide-x sm:divide-border"
          )}
        >
          <div
            className={cn(
              "grid content-center gap-1",
              showFinancing && "sm:pr-5"
            )}
          >
            {priceHint ? (
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {priceHint}
              </p>
            ) : null}
            <p className="text-3xl font-extrabold tracking-tight text-foreground lg:text-[2.125rem] lg:leading-none">
              {priceLabel}
            </p>
          </div>
          {showFinancing ? (
            <div
              className={cn(
                "flex items-center gap-3 border-t border-border pt-4",
                "sm:border-t-0 sm:pt-0 sm:pl-5"
              )}
            >
              <span
                className="flex size-10 shrink-0 items-center justify-center rounded-sm border border-border bg-muted/40 text-foreground"
                aria-hidden
              >
                <LuBanknote className="size-4" strokeWidth={2} />
              </span>
              <div className="grid min-w-0 flex-1 gap-0.5">
                {financingLabel ? (
                  <p className="text-[11px] font-medium text-muted-foreground">
                    {financingLabel}
                  </p>
                ) : null}
                {financingAmount ? (
                  <p className="truncate text-base font-bold tracking-tight text-foreground">
                    {financingAmount}
                  </p>
                ) : null}
                {financingHint ? (
                  <p className="text-[10px] leading-snug text-muted-foreground/80">
                    {financingHint}
                  </p>
                ) : null}
              </div>
              <LuChevronRight
                className="size-4 shrink-0 text-muted-foreground"
                strokeWidth={2}
                aria-hidden
              />
            </div>
          ) : null}
        </div>

        {cta || secondaryCta ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {cta ? <div className="min-w-0 [&>*]:w-full">{cta}</div> : null}
            {secondaryCta ? (
              <div className="min-w-0 [&>*]:w-full">{secondaryCta}</div>
            ) : null}
          </div>
        ) : null}

        {trust.length > 0 ? (
          <ul className="grid grid-cols-2 gap-x-3 gap-y-3 border-t border-border pt-4 sm:grid-cols-4 sm:gap-0 sm:divide-x sm:divide-border">
            {trust.map((item) => (
              <li
                key={item.id}
                className="flex min-w-0 items-start gap-2 sm:px-2.5 first:sm:pl-0 last:sm:pr-0"
              >
                <item.Icon
                  className="mt-0.5 size-3.5 shrink-0 text-foreground"
                  strokeWidth={2}
                  aria-hidden
                />
                <span className="min-w-0 text-[11px] font-medium leading-snug text-muted-foreground">
                  {item.label}
                  {item.hint ? (
                    <span className="block text-[10px] font-normal text-muted-foreground/80">
                      {item.hint}
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
