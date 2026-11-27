"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  CtaInquiryTrigger,
  type CtaInquiryContextValue,
} from "@/components/cta/cta-inquiry";
import { Slider } from "@/components/ui/slider";
import {
  segmentTabsListClassName,
  segmentTabsTriggerClassName,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { formatProductPrice } from "@/lib/catalog/product-page";
import {
  financingQuote,
  type FinanceMode,
  type FinancingOffer,
} from "@/lib/finance/financing-quote";
import type { CurrencyDisplayMode } from "@/lib/finance/types";
import { cn } from "@/lib/utils";

function formatSliderPercent(value: number) {
  return String(Math.round(value * 100) / 100);
}

export default function FinancingCalculator({
  offer,
  currencyDisplayMode,
  inquiry,
  className,
}: {
  offer: FinancingOffer;
  currencyDisplayMode: CurrencyDisplayMode;
  inquiry?: CtaInquiryContextValue;
  className?: string;
}) {
  const t = useTranslations("Product");
  const locale = useLocale();
  const [mode, setMode] = useState<FinanceMode>("credit");
  const preset = mode === "credit" ? offer.credit : offer.lease;
  const [levels, setLevels] = useState(() => ({
    credit: {
      down: offer.credit.downPaymentPercentDefault,
      months: offer.credit.termMonthsDefault,
    },
    lease: {
      down: offer.lease.downPaymentPercentDefault,
      months: offer.lease.termMonthsDefault,
    },
  }));
  const level = levels[mode];

  function selectMode(next: string) {
    setMode(next === "lease" ? "lease" : "credit");
  }

  function setDown(value: number) {
    setLevels((current) => ({
      ...current,
      [mode]: { ...current[mode], down: value },
    }));
  }

  function setMonths(value: number) {
    setLevels((current) => ({
      ...current,
      [mode]: { ...current[mode], months: value },
    }));
  }

  const quote = useMemo(
    () => financingQuote(offer.baseAmount, mode, preset, level.down, level.months),
    [offer.baseAmount, mode, preset, level.down, level.months]
  );

  const main = offer.lines[0];
  const mainCode = main?.currencyCode ?? "USD";

  function money(amount: number, perMain = 1, code = mainCode) {
    return formatProductPrice(
      amount * perMain,
      locale,
      code,
      currencyDisplayMode
    );
  }

  const visibility = offer.facts;
  const extras = offer.lines.slice(1);
  type QuoteFact =
    | { key: string; label: string; kind: "money"; amount: number }
    | { key: string; label: string; kind: "text"; text: string };
  const facts: QuoteFact[] = [
    visibility.down
      ? {
          key: "down",
          label: t("financingDown"),
          kind: "money" as const,
          amount: quote.downAmount,
        }
      : null,
    mode === "lease" && visibility.residual
      ? {
          key: "residual",
          label: t("financingResidual"),
          kind: "money" as const,
          amount: quote.residualAmount,
        }
      : null,
    visibility.total
      ? {
          key: "total",
          label: t("financingTotal"),
          kind: "money" as const,
          amount: quote.total,
        }
      : null,
    visibility.rate
      ? {
          key: "rate",
          label: t("financingRate"),
          kind: "text" as const,
          text: t("financingRateValue", { rate: quote.annualRatePercent }),
        }
      : null,
  ].filter((fact) => fact != null);

  const decisionSummary = t("financingDecisionSummary", {
    mode: mode === "lease" ? t("financingLease") : t("financingCredit"),
    down: formatSliderPercent(quote.downPercent),
    term: t("financingMonths", { count: quote.months }),
    monthly: money(quote.monthly),
  });

  return (
    <section
      id="financing"
      className={cn(
        "scroll-mt-24 rounded-sm border border-border bg-card p-5 sm:p-6",
        className
      )}
    >
      <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="grid min-w-0 content-start gap-6 lg:col-start-1 lg:row-start-1">
          <Tabs value={mode} onValueChange={selectMode} className="w-full">
            <TabsList className={segmentTabsListClassName}>
              <TabsTrigger
                value="credit"
                className={segmentTabsTriggerClassName}
              >
                {t("financingCredit")}
              </TabsTrigger>
              <TabsTrigger
                value="lease"
                className={segmentTabsTriggerClassName}
              >
                {t("financingLease")}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <label className="grid w-full gap-3">
            <span className="flex items-baseline justify-between gap-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                {t("financingDown")}
              </span>
              <span className="text-sm font-semibold tabular-nums text-foreground">
                {money(quote.downAmount)}
                <span className="ml-2 font-medium text-muted-foreground">
                  {formatSliderPercent(quote.downPercent)}%
                </span>
              </span>
            </span>
            <Slider
              min={preset.downPaymentPercentMin}
              max={preset.downPaymentPercentMax}
              step={preset.downPaymentPercentStep}
              value={[quote.downPercent]}
              onValueChange={([next]) => setDown(next ?? quote.downPercent)}
              aria-label={t("financingDown")}
            />
          </label>

          <label className="grid w-full gap-3">
            <span className="flex items-baseline justify-between gap-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                {t("financingTerm")}
              </span>
              <span className="text-sm font-semibold tabular-nums text-foreground">
                {t("financingMonths", { count: quote.months })}
              </span>
            </span>
            <Slider
              min={preset.termMonthsMin}
              max={preset.termMonthsMax}
              step={preset.termMonthsStep}
              value={[quote.months]}
              onValueChange={([next]) => setMonths(next ?? quote.months)}
              aria-label={t("financingTerm")}
            />
          </label>
        </div>

        <div className="grid min-w-0 content-start gap-4 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:justify-items-end lg:text-right">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            {t("financingFrom")}
          </p>
          <div className="grid gap-1 lg:justify-items-end">
            <p className="text-3xl font-extrabold tabular-nums tracking-tight text-foreground sm:text-4xl sm:leading-none">
              {money(quote.monthly)}
            </p>
            {offer.lines.slice(1).map((line) => (
              <p
                key={line.currencyCode}
                className="text-lg font-bold tabular-nums tracking-tight text-foreground sm:text-xl"
              >
                {money(quote.monthly, line.perMain, line.currencyCode)}
              </p>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">{t("financingMonthly")}</p>
          {facts.length > 0 ? (
            <dl className="grid w-full gap-2 border-t border-border pt-4">
              {facts.map((fact) => (
                <div
                  key={fact.key}
                  className="flex items-start justify-between gap-4 text-sm"
                >
                  <dt className="text-muted-foreground">{fact.label}</dt>
                  <dd className="grid justify-items-end gap-0.5 text-right">
                    <span className="font-medium tabular-nums text-foreground">
                      {fact.kind === "money" ? money(fact.amount) : fact.text}
                    </span>
                    {fact.kind === "money"
                      ? extras.map((line) => (
                          <span
                            key={line.currencyCode}
                            className="font-medium tabular-nums text-muted-foreground"
                          >
                            {money(fact.amount, line.perMain, line.currencyCode)}
                          </span>
                        ))
                      : null}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
          <p className="max-w-md text-xs leading-relaxed text-muted-foreground lg:justify-self-end">
            {t("financingDisclaimer")}
          </p>
        </div>

        <div className="grid min-w-0 content-start gap-3 rounded-sm border border-border bg-muted/40 p-4 lg:col-start-1 lg:row-start-2">
          <div className="grid gap-1">
            <h3 className="text-sm font-semibold tracking-tight text-foreground">
              {t("financingDecisionTitle")}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {decisionSummary}
            </p>
          </div>
          <CtaInquiryTrigger
            className="w-full"
            context={{
              productId: inquiry?.productId,
              productName: inquiry?.productName,
              productCode: inquiry?.productCode,
              note: decisionSummary,
            }}
          >
            {t("financingDecisionTitle")}
          </CtaInquiryTrigger>
        </div>
      </div>
    </section>
  );
}
