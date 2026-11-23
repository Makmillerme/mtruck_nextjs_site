import { cache } from "react";
import prisma from "@/utils/db";
import type {
  CurrencyDisplayMode,
  FinanceSettingsDto,
} from "@/lib/finance/types";
export const FINANCE_SETTINGS_ID = "default";

export function mapFinanceSettings(row: {
  id: string;
  baseCurrencyCode: string;
  siteCurrencyCode: string;
  allowBuyerCurrencySwitch: boolean;
  currencyDisplayMode: CurrencyDisplayMode;
}): FinanceSettingsDto {
  return {
    id: row.id,
    baseCurrencyCode: row.baseCurrencyCode,
    siteCurrencyCode: row.siteCurrencyCode,
    allowBuyerCurrencySwitch: row.allowBuyerCurrencySwitch,
    currencyDisplayMode: row.currencyDisplayMode,
  };
}

export const getFinanceSettings = cache(async (): Promise<FinanceSettingsDto | null> => {
  const row = await prisma.financeSettings.findUnique({
    where: { id: FINANCE_SETTINGS_ID },
  });
  return row ? mapFinanceSettings(row) : null;
});

export const getCurrencyDisplayMode = cache(
  async (): Promise<CurrencyDisplayMode> => {
    const settings = await getFinanceSettings();
    return settings?.currencyDisplayMode ?? "CODE";
  }
);
