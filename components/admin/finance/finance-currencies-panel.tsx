import FinanceCurrenciesView from "@/components/admin/finance/finance-currencies-view";
import { listCurrencies } from "@/lib/finance/currencies";
import { getFinanceSettings } from "@/lib/finance/settings";

export default async function FinanceCurrenciesPanel() {
  const [currencies, settings] = await Promise.all([
    listCurrencies(),
    getFinanceSettings(),
  ]);

  return (
    <FinanceCurrenciesView
      currencies={currencies.map((row) => ({
        code: row.code,
        name: row.name,
        nameEn: row.nameEn,
        isActive: row.isActive,
        isBuyerVisible: row.isBuyerVisible,
        rateToBase: row.rateToBase?.toString() ?? null,
        rateUpdatedAt: row.rateUpdatedAt?.toISOString() ?? null,
        productCount: row.productCount,
      }))}
      settings={
        settings
          ? {
              baseCurrencyCode: settings.baseCurrencyCode,
              siteCurrencyCode: settings.siteCurrencyCode,
              allowBuyerCurrencySwitch: settings.allowBuyerCurrencySwitch,
            }
          : null
      }
    />
  );
}
