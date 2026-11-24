import { convertViaBase } from "@/lib/finance/convert";
import { getCurrencyRatesMap, listCurrencies } from "@/lib/finance/currencies";
import { formatDisplayMoneyLabel } from "@/lib/finance/format-display";
import { applyPromo } from "@/lib/finance/promo";
import {
  listRootPricing,
  loadTaxonomyParentIndex,
  rootIdFromParentIndex,
} from "@/lib/finance/root-pricing";
import { getFinanceSettings } from "@/lib/finance/settings";
import { cache } from "react";
import { splitVat } from "@/lib/finance/vat";
import type {
  PriceLine,
  PromoKind,
  RootPricingDto,
  StorefrontPriceDisplay,
} from "@/lib/finance/types";
import type { Decimal } from "@prisma/client/runtime/library";

type ProductMoney = {
  price: number;
  currency: string;
  taxonomyNodeId?: string | null;
  promoKind?: PromoKind | null;
  promoValue?: Decimal | number | string | null;
};

async function convertAmount(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, Decimal | null>,
  minor: number
): Promise<number | null> {
  if (from === to) return amount;
  const converted = convertViaBase(amount, from, to, rates, minor);
  return converted == null ? null : converted.toNumber();
}

function pushConverted(
  lines: PriceLine[],
  kind: PriceLine["kind"],
  amount: number,
  from: string,
  to: string,
  rates: Record<string, Decimal | null>,
  minorByCode: Map<string, number>,
  labelKey?: PriceLine["labelKey"]
) {
  const minor = minorByCode.get(to) ?? 0;
  const next = convertViaBase(amount, from, to, rates, minor);
  if (next == null) return;
  lines.push({
    kind,
    labelKey,
    amount: next.toNumber(),
    currencyCode: to,
  });
}

const loadStorefrontPriceContext = cache(async () => {
  const [settings, rates, currencies, pricingRows, parents] = await Promise.all([
    getFinanceSettings(),
    getCurrencyRatesMap(),
    listCurrencies(),
    listRootPricing(),
    loadTaxonomyParentIndex(),
  ]);
  return {
    settings,
    rates,
    currencies,
    pricingByRoot: new Map(pricingRows.map((row) => [row.taxonomyNodeId, row])),
    parents,
  };
});

export async function buildStorefrontPriceDisplay(
  product: ProductMoney,
  locale: string,
  buyerCurrency?: string | null
): Promise<StorefrontPriceDisplay> {
  const context = await loadStorefrontPriceContext();
  const { settings, rates, currencies } = context;
  const currencyDisplayMode = settings?.currencyDisplayMode ?? "CODE";
  const rootId = rootIdFromParentIndex(product.taxonomyNodeId, context.parents);
  const pricing = rootId ? context.pricingByRoot.get(rootId) ?? null : null;

  const sourceCode = (product.currency || settings?.baseCurrencyCode || "USD").toUpperCase();
  const promo =
    product.promoKind && product.promoValue != null
      ? { kind: product.promoKind, value: product.promoValue }
      : null;
  const saleAmount = applyPromo(product.price, promo);
  const hasPromo = saleAmount !== product.price;

  const defaults: RootPricingDto = {
    taxonomyNodeId: "",
    vatEnabled: false,
    entryMode: "INCL_VAT",
    storefrontPriceMode: "INCL_VAT",
    vatPercent: 0,
    showPriceWithVat: false,
    showPriceWithoutVat: false,
    showVatAmount: false,
    displayMode: "SINGLE",
    mainCurrencyCode: settings?.baseCurrencyCode ?? sourceCode,
    vatDisplayCurrencyCode: settings?.baseCurrencyCode ?? sourceCode,
    allowBuyerCurrencySwitch: false,
    financingEnabled: true,
    extraCurrencyCodes: [],
  };
  const config = pricing ?? defaults;
  const storefrontMode = config.storefrontPriceMode ?? config.entryMode;
  const vat = splitVat(saleAmount, config.entryMode, config.vatPercent, 0);

  const minorByCode = new Map(
    currencies.map((row) => [row.code, row.minorUnits])
  );

  let targetMain = config.mainCurrencyCode;
  if (
    config.displayMode === "SINGLE" &&
    config.allowBuyerCurrencySwitch &&
    buyerCurrency
  ) {
    const code = buyerCurrency.toUpperCase();
    if (currencies.some((row) => row.code === code && row.isActive)) {
      targetMain = code;
    }
  }

  const primaryAmount = !config.vatEnabled
    ? saleAmount
    : storefrontMode === "INCL_VAT"
      ? vat.gross
      : vat.net;
  const priceMode = !config.vatEnabled ? "PLAIN" : storefrontMode;
  const vatCurrency = (
    config.vatDisplayCurrencyCode || config.mainCurrencyCode
  ).toUpperCase();

  const lines: PriceLine[] = [];
  const mainConverted = await convertAmount(
    primaryAmount,
    sourceCode,
    targetMain,
    rates,
    minorByCode.get(targetMain) ?? 0
  );

  // Pricing.mainCurrencyCode is the buyer-facing currency. Finance base currency
  // is only the FX anchor — never substitute it for a successful main line.
  const mainRateMissing = mainConverted == null;
  const displayMainCode = mainRateMissing ? sourceCode : targetMain;
  const displayMainAmount = mainRateMissing ? primaryAmount : mainConverted;

  lines.push({
    kind: "main",
    amount: displayMainAmount,
    currencyCode: displayMainCode,
  });

  // Compare the currency of the on-screen main amount with VAT sums currency
  // (not the product's stored currency — after FX they can diverge).
  const vatCurrenciesDiffer =
    config.vatEnabled && displayMainCode.toUpperCase() !== vatCurrency;

  if (config.vatEnabled) {
    const wantNet = config.showPriceWithoutVat;
    const wantVat = config.showVatAmount;
    const wantGross = config.showPriceWithVat;

    if (vatCurrenciesDiffer) {
      // Order: Без ПДВ → ПДВ → З ПДВ when VAT currency ≠ main display currency.
      if (wantNet) {
        pushConverted(
          lines,
          "net",
          vat.net,
          sourceCode,
          vatCurrency,
          rates,
          minorByCode,
          "priceWithoutVat"
        );
      }
      if (wantVat) {
        pushConverted(
          lines,
          "vat",
          vat.vat,
          sourceCode,
          vatCurrency,
          rates,
          minorByCode,
          "vatAmount"
        );
      }
      if (wantGross) {
        pushConverted(
          lines,
          "gross",
          vat.gross,
          sourceCode,
          vatCurrency,
          rates,
          minorByCode,
          "priceWithVat"
        );
      }
    } else if (storefrontMode === "INCL_VAT") {
      // Main already shows gross — only complements.
      if (wantNet) {
        pushConverted(
          lines,
          "net",
          vat.net,
          sourceCode,
          vatCurrency,
          rates,
          minorByCode,
          "priceWithoutVat"
        );
      }
      if (wantVat) {
        pushConverted(
          lines,
          "vat",
          vat.vat,
          sourceCode,
          vatCurrency,
          rates,
          minorByCode,
          "vatAmount"
        );
      }
    } else {
      // Main already shows net — only complements.
      if (wantGross) {
        pushConverted(
          lines,
          "gross",
          vat.gross,
          sourceCode,
          vatCurrency,
          rates,
          minorByCode,
          "priceWithVat"
        );
      }
      if (wantVat) {
        pushConverted(
          lines,
          "vat",
          vat.vat,
          sourceCode,
          vatCurrency,
          rates,
          minorByCode,
          "vatAmount"
        );
      }
    }
  }

  if (config.displayMode === "STACKED") {
    for (const code of config.extraCurrencyCodes) {
      // Skip the intended main and the fallback main to avoid duplicates.
      if (code === targetMain || code === displayMainCode) continue;
      pushConverted(
        lines,
        "extra",
        primaryAmount,
        sourceCode,
        code,
        rates,
        minorByCode
      );
    }
  }

  let struckLabel: string | null = null;
  if (hasPromo && !mainRateMissing) {
    const wasVat = splitVat(
      product.price,
      config.entryMode,
      config.vatPercent,
      0
    );
    const wasAmount = !config.vatEnabled
      ? product.price
      : storefrontMode === "INCL_VAT"
        ? wasVat.gross
        : wasVat.net;
    const wasConverted = await convertAmount(
      wasAmount,
      sourceCode,
      targetMain,
      rates,
      minorByCode.get(targetMain) ?? 0
    );
    if (wasConverted != null) {
      struckLabel = formatDisplayMoneyLabel(
        {
          amount: wasConverted,
          currencyCode: targetMain,
          converted: true,
          original: { amount: wasAmount, currencyCode: sourceCode },
        },
        locale,
        currencyDisplayMode
      );
      lines.push({
        kind: "was",
        labelKey: "wasPrice",
        amount: wasConverted,
        currencyCode: targetMain,
      });
    }
  }

  const main = lines.find((line) => line.kind === "main")!;
  return {
    priceLabel: formatDisplayMoneyLabel(
      {
        amount: main.amount,
        currencyCode: main.currencyCode,
        converted: !mainRateMissing && main.currencyCode !== sourceCode,
        hintKey: mainRateMissing ? "rateMissing" : undefined,
        original: { amount: product.price, currencyCode: sourceCode },
      },
      locale,
      currencyDisplayMode
    ),
    priceMode,
    priceHint: mainRateMissing ? "rateMissing" : null,
    vatCurrenciesDiffer,
    currencyDisplayMode,
    financingEnabled: config.financingEnabled,
    financingLabel: null,
    financingAmountLabel: null,
    lines,
    struckLabel,
  };
}
