import FinancePricingView from "@/components/admin/finance/finance-pricing-view";
import { listActiveCurrencies } from "@/lib/finance/currencies";
import {
  defaultRootPricingDraft,
  listCatalogRoots,
  listRootPricing,
} from "@/lib/finance/root-pricing";
import { getFinanceSettings } from "@/lib/finance/settings";

export default async function FinancePricingPanel() {
  const [roots, pricingRows, currencies, settings] = await Promise.all([
    listCatalogRoots(),
    listRootPricing(),
    listActiveCurrencies(),
    getFinanceSettings(),
  ]);

  const byRoot = new Map(pricingRows.map((row) => [row.taxonomyNodeId, row]));
  const fallbackMain =
    settings?.baseCurrencyCode ?? currencies[0]?.code ?? "USD";

  const initial =
    roots[0] != null
      ? byRoot.get(roots[0].id) ??
        (await defaultRootPricingDraft(roots[0].id))
      : {
          taxonomyNodeId: "ALL",
          vatEnabled: true,
          entryMode: "INCL_VAT" as const,
          storefrontPriceMode: "INCL_VAT" as const,
          vatPercent: 0,
          showPriceWithVat: true,
          showPriceWithoutVat: false,
          showVatAmount: false,
          displayMode: "SINGLE" as const,
          mainCurrencyCode: fallbackMain,
          vatDisplayCurrencyCode: fallbackMain,
          allowBuyerCurrencySwitch: false,
          financingEnabled: true,
          vatSumsEnabled: true,
          financingFacts: {
            down: true,
            residual: true,
            total: true,
            rate: true,
          },
          credit: {
            annualRatePercent: 14,
            termMonthsMin: 12,
            termMonthsMax: 60,
            termMonthsDefault: 36,
            termMonthsStep: 1,
            downPaymentPercentMin: 0,
            downPaymentPercentMax: 50,
            downPaymentPercentDefault: 20,
            downPaymentPercentStep: 1,
            residualPercent: null,
          },
          lease: {
            annualRatePercent: 12,
            termMonthsMin: 12,
            termMonthsMax: 48,
            termMonthsDefault: 36,
            termMonthsStep: 1,
            downPaymentPercentMin: 0,
            downPaymentPercentMax: 40,
            downPaymentPercentDefault: 10,
            downPaymentPercentStep: 1,
            residualPercent: 45,
          },
          extraCurrencyCodes: [] as string[],
        };

  const ratesByCode = Object.fromEntries(
    currencies.map((row) => [
      row.code,
      row.rateToBase == null ? null : Number(row.rateToBase),
    ])
  );

  return (
    <FinancePricingView
      roots={roots.map((root) => ({ id: root.id, name: root.name }))}
      pricingByRoot={Object.fromEntries(byRoot)}
      currencyOptions={currencies.map((row) => ({
        value: row.code,
        label: `${row.code} — ${row.name}`,
      }))}
      ratesByCode={ratesByCode}
      baseCurrencyCode={fallbackMain}
      initialScope={roots[0]?.id ?? "ALL"}
      initialPricing={initial}
    />
  );
}
