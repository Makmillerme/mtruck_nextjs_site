import type { Decimal } from "@prisma/client/runtime/library";

export type MoneyAmount = {
  amount: number;
  currencyCode: string;
};

export type CurrencyDto = {
  code: string;
  name: string;
  nameEn: string;
  numericCode: number | null;
  minorUnits: number;
  isActive: boolean;
  isBuyerVisible: boolean;
  rateToBase: Decimal | null;
  rateUpdatedAt: Date | null;
  sortOrder: number;
};

export type CurrencyDisplayMode = "CODE" | "SYMBOL";

export type FinanceSettingsDto = {
  id: string;
  baseCurrencyCode: string;
  siteCurrencyCode: string;
  allowBuyerCurrencySwitch: boolean;
  currencyDisplayMode: CurrencyDisplayMode;
};

export type DisplayMoney = {
  amount: number;
  currencyCode: string;
  converted: boolean;
  /** Shown when conversion was unavailable. */
  hintKey?: "rateMissing";
  original: MoneyAmount;
};

export type PriceEntryMode = "INCL_VAT" | "EXCL_VAT";
export type PriceDisplayMode = "SINGLE" | "STACKED";
export type PromoKind = "AMOUNT" | "PERCENT";

export type RootPricingDto = {
  taxonomyNodeId: string;
  vatEnabled: boolean;
  entryMode: PriceEntryMode;
  /** Main amount shown to buyers: INCL_VAT = gross, EXCL_VAT = net. */
  storefrontPriceMode: PriceEntryMode;
  vatPercent: number;
  showPriceWithVat: boolean;
  showPriceWithoutVat: boolean;
  showVatAmount: boolean;
  displayMode: PriceDisplayMode;
  mainCurrencyCode: string;
  /** Empty/null means same as mainCurrencyCode. */
  vatDisplayCurrencyCode: string | null;
  allowBuyerCurrencySwitch: boolean;
  financingEnabled: boolean;
  extraCurrencyCodes: string[];
};

/** Compact per-root VAT config for the product admin sheet. */
export type RootVatUiConfig = {
  vatEnabled: boolean;
  entryMode: PriceEntryMode;
  vatPercent: number;
  vatDisplayCurrencyCode: string | null;
  mainCurrencyCode: string;
};

export type PriceLine = {
  kind: "main" | "extra" | "net" | "gross" | "vat" | "was";
  labelKey?:
    | "priceWithVat"
    | "priceWithoutVat"
    | "vatAmount"
    | "wasPrice";
  amount: number;
  currencyCode: string;
};

export type StorefrontPriceMode = "PLAIN" | "INCL_VAT" | "EXCL_VAT";

export type StorefrontPriceDisplay = {
  priceLabel: string;
  /** How the main buyer-facing amount is framed (with/without VAT caption). */
  priceMode: StorefrontPriceMode;
  priceHint: string | null;
  /** True when main display currency ≠ VAT display currency (triple VAT lines). */
  vatCurrenciesDiffer: boolean;
  /** Site-wide currency notation from FinanceSettings. */
  currencyDisplayMode: CurrencyDisplayMode;
  /** Root pricing: show financing estimate on card/PDP. */
  financingEnabled: boolean;
  /** Prefetched monthly estimate label (i18n), when financing is on. */
  financingLabel: string | null;
  financingAmountLabel: string | null;
  lines: PriceLine[];
  struckLabel: string | null;
};
