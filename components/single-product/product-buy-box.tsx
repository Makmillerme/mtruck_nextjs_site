"use client";

import { Fragment, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import ProductKeyFacts from "@/components/single-product/product-key-facts";
import type { ProductKeyFact } from "@/lib/catalog/product-page";
import { cn } from "@/lib/utils";
import {
  LuBanknote,
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

export type BuyBoxPriceLine = {
  title: string;
  amount: string;
  muted?: boolean;
  emphasize?: boolean;
};

/** Order matches PDP trustItems: delivery → service → prep → documents. */
const TRUST_ICONS = [LuTruck, LuWrench, LuSparkles, LuFileCheck] as const;

function FinancingCalcLink({
  label,
  grouped = false,
}: {
  label: string;
  /** Parent is already the hit target; this node only draws the label and arrow. */
  grouped?: boolean;
}) {
  const motion =
    "inline-flex flex-col items-center gap-1.5 text-foreground outline-none transition-transform duration-300 ease-out group-hover:scale-[1.06] group-focus-visible:scale-[1.06] sm:gap-2";
  const arrow = (
    <svg
      viewBox="0 0 160 12"
      preserveAspectRatio="none"
      className="h-2 w-[5.75rem] origin-center text-foreground transition-transform duration-300 ease-out group-hover:scale-x-110 group-focus-visible:scale-x-110 sm:h-2.5 sm:w-[11rem]"
      fill="none"
      aria-hidden
    >
      <path
        d="M1 6H152M152 6L144.5 1.75M152 6L144.5 10.25"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
  const caption = (
    <span className="font-mono text-[10px] font-semibold uppercase leading-none tracking-[0.14em] sm:text-[11px] sm:tracking-[0.22em]">
      {label}
    </span>
  );

  if (grouped) {
    return (
      <span className={motion}>
        {caption}
        {arrow}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={scrollToFinancing}
      className={cn("group", motion, "hover:scale-[1.06] focus-visible:scale-[1.06]")}
    >
      {caption}
      {arrow}
    </button>
  );
}

function scrollToFinancing() {
  document.getElementById("financing")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function FinancingPanel({
  financingLabel,
  financingAmount,
  financingExtraLabels = [],
  financingCalcLabel,
  split = false,
  className,
}: {
  financingLabel?: string | null;
  financingAmount?: string | null;
  financingExtraLabels?: string[];
  financingCalcLabel?: string | null;
  /** Match price|VAT columns without a divider strip. */
  split?: boolean;
  className?: string;
}) {
  const body = (alignEnd = false) => (
    <span
      className={cn(
        "flex min-w-0 items-center gap-2.5 sm:gap-3",
        alignEnd && "w-fit"
      )}
    >
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-sm border border-border/80 bg-background text-foreground sm:size-11"
        aria-hidden
      >
        <LuBanknote className="size-4 sm:size-[1.125rem]" strokeWidth={1.75} />
      </span>
      <span
        className={cn(
          "grid min-w-0 gap-0.5 sm:gap-1",
          alignEnd ? "text-left" : "flex-1"
        )}
      >
        {financingLabel ? (
          <span className="whitespace-nowrap font-mono text-[10px] uppercase leading-tight tracking-[0.12em] text-muted-foreground sm:text-[11px] sm:tracking-[0.16em]">
            {financingLabel}
          </span>
        ) : null}
        {financingAmount ? (
          <span className="whitespace-nowrap text-base font-bold leading-tight tabular-nums tracking-tight text-foreground sm:text-2xl">
            {financingAmount}
          </span>
        ) : null}
        {financingExtraLabels.map((label) => (
          <span
            key={label}
            className="whitespace-nowrap text-xs tabular-nums tracking-tight text-muted-foreground sm:text-sm"
          >
            {label}
          </span>
        ))}
      </span>
    </span>
  );

  if (split && financingCalcLabel) {
    return (
      <button
        type="button"
        className={cn(
          "group grid w-full cursor-pointer grid-cols-2 items-center gap-0 border-0 bg-transparent p-0 text-left",
          className
        )}
        onClick={scrollToFinancing}
      >
        <span className="flex min-w-0 justify-center pr-3 sm:pr-5">
          {body(true)}
        </span>
        <span className="flex min-w-0 items-center justify-center pl-3 sm:pl-5">
          <FinancingCalcLink label={financingCalcLabel} grouped />
        </span>
      </button>
    );
  }

  if (financingCalcLabel) {
    return (
      <button
        type="button"
        onClick={scrollToFinancing}
        className={cn(
          "group grid min-w-0 w-full cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-0 bg-transparent p-0 text-left",
          className
        )}
      >
        {body()}
        <span className="flex shrink-0 items-center justify-end">
          <FinancingCalcLink label={financingCalcLabel} grouped />
        </span>
      </button>
    );
  }

  return <div className={cn("grid min-w-0 gap-3", className)}>{body()}</div>;
}

function VatBreakdown({
  priceLines,
  className,
}: {
  priceLines: BuyBoxPriceLine[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid min-w-0 content-center justify-items-center",
        className
      )}
    >
      <div className="grid w-max max-w-full grid-cols-[max-content_max-content] items-baseline gap-x-1 gap-y-1 sm:gap-x-1.5 sm:gap-y-2.5">
        {priceLines.map((line) => {
          const title = line.title
            ? line.title.endsWith(":")
              ? line.title
              : `${line.title}:`
            : "";
          return (
            <Fragment key={`${line.title}-${line.amount}`}>
              {title ? (
                <p
                  className={cn(
                    "text-left text-xs sm:text-sm",
                    line.emphasize
                      ? "font-medium text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {title}
                </p>
              ) : (
                <span />
              )}
              <p
                className={cn(
                  "text-left tabular-nums tracking-tight",
                  line.emphasize
                    ? "text-sm font-semibold text-foreground sm:text-lg"
                    : line.muted
                      ? "text-sm text-muted-foreground sm:text-lg"
                      : "text-sm font-medium text-foreground sm:text-lg"
                )}
              >
                {line.amount}
              </p>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default function ProductBuyBox({
  categoryLabel,
  name,
  priceLabel,
  struckLabel,
  extraPriceLines = [],
  priceLines = [],
  availabilityLabel,
  availabilityTone = "default",
  availabilityClassName,
  facts = [],
  articleLabel,
  financingLabel,
  financingAmount,
  financingExtraLabels = [],
  financingCalcLabel,
  trustItems = [],
  actions,
  cta,
  secondaryCta,
  contact,
  className,
}: {
  categoryLabel?: string | null;
  name: string;
  priceLabel: string;
  struckLabel?: string | null;
  /** Converted amounts under the main price (STACKED extras) — not the VAT column. */
  extraPriceLines?: string[];
  priceLines?: BuyBoxPriceLine[];
  /** When omitted or empty — no status badge (quiet in-stock). */
  availabilityLabel?: string | null;
  availabilityTone?: "default" | "secondary" | "outline";
  /** Soft colored chip (PDP canon — matches card dot palette). */
  availabilityClassName?: string | null;
  facts?: ProductKeyFact[];
  articleLabel?: string | null;
  /** Static financing eyebrow, e.g. "Фінансування від". */
  financingLabel?: string | null;
  /** Static monthly amount, e.g. "≈ 1 420 USD/міс". */
  financingAmount?: string | null;
  /** Extra-currency monthly amounts under the main figure. */
  financingExtraLabels?: string[];
  /** Label that scrolls to the on-page calculator. */
  financingCalcLabel?: string | null;
  trustItems?: { id: string; label: string; hint?: string }[];
  actions?: ReactNode;
  cta?: ReactNode;
  secondaryCta?: ReactNode;
  /** Phone / Telegram / hours under CTAs. */
  contact?: ReactNode;
  className?: string;
}) {
  const showFinancing = Boolean(financingLabel || financingAmount);
  const hasVatBreakdown = priceLines.length > 0;
  const hasExtras = extraPriceLines.length > 0;
  const trust: TrustItem[] = trustItems.map((item, index) => ({
    ...item,
    Icon: TRUST_ICONS[index % TRUST_ICONS.length]!,
  }));

  const heroPrice = (
    <div
      className={cn(
        "grid w-fit max-w-full gap-0.5 sm:gap-1",
        (hasVatBreakdown || hasExtras) &&
          "justify-items-end text-right"
      )}
    >
      {struckLabel ? (
        <p className="text-sm text-muted-foreground line-through">{struckLabel}</p>
      ) : null}
      <p className="text-2xl font-extrabold leading-none tracking-tight text-foreground sm:text-4xl">
        {priceLabel}
      </p>
      {hasExtras
        ? extraPriceLines.map((line) => (
            <p
              key={line}
              className="text-base font-bold tabular-nums tracking-tight text-foreground sm:text-xl"
            >
              {line}
            </p>
          ))
        : null}
    </div>
  );

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
            {availabilityLabel ? (
              <Badge
                variant={availabilityClassName ? "outline" : availabilityTone}
                className={cn("shrink-0 font-semibold", availabilityClassName)}
              >
                {availabilityLabel}
              </Badge>
            ) : null}
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
        {hasVatBreakdown ? (
          <div className="grid gap-4 rounded-sm border border-border bg-card p-4 sm:gap-5 sm:p-6">
            <div className="grid grid-cols-2 items-center gap-0 divide-x divide-border">
              <div className="flex min-w-0 justify-center pr-3 sm:pr-5">
                {heroPrice}
              </div>
              <VatBreakdown priceLines={priceLines} className="pl-3 sm:pl-5" />
            </div>
            {showFinancing ? (
              <FinancingPanel
                financingLabel={financingLabel}
                financingAmount={financingAmount}
                financingExtraLabels={financingExtraLabels}
                financingCalcLabel={financingCalcLabel}
                split
                className="border-t border-border pt-5"
              />
            ) : null}
          </div>
        ) : (
          <div
            className={cn(
              "grid gap-4 rounded-sm border border-border bg-card p-4 sm:gap-5 sm:p-6",
              showFinancing &&
                "sm:grid-cols-2 sm:items-center sm:gap-0 sm:divide-x sm:divide-border"
            )}
          >
            <div className={cn(showFinancing && "sm:pr-5")}>{heroPrice}</div>
            {showFinancing ? (
              <FinancingPanel
                financingLabel={financingLabel}
                financingAmount={financingAmount}
                financingExtraLabels={financingExtraLabels}
                financingCalcLabel={financingCalcLabel}
                className="border-t border-border pt-5 sm:border-t-0 sm:pt-0 sm:pl-5"
              />
            ) : null}
          </div>
        )}

        {cta || secondaryCta ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {cta ? <div className="min-w-0 [&>*]:w-full">{cta}</div> : null}
            {secondaryCta ? (
              <div className="min-w-0 [&>*]:w-full">{secondaryCta}</div>
            ) : null}
          </div>
        ) : null}

        {contact}

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
                <a
                  href="#product-terms"
                  className="min-w-0 text-[11px] font-medium leading-snug text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                >
                  {item.label}
                  {item.hint ? (
                    <span className="block text-[10px] font-normal text-muted-foreground/80 no-underline">
                      {item.hint}
                    </span>
                  ) : null}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
