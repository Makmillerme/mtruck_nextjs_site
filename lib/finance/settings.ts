import { cache } from "react";
import prisma from "@/utils/db";
import type { FinanceSettingsDto } from "@/lib/finance/types";
export const FINANCE_SETTINGS_ID = "default";

export function mapFinanceSettings(row: {
  id: string;
  baseCurrencyCode: string;
  siteCurrencyCode: string;
  allowBuyerCurrencySwitch: boolean;
}): FinanceSettingsDto {
  return {
    id: row.id,
    baseCurrencyCode: row.baseCurrencyCode,
    siteCurrencyCode: row.siteCurrencyCode,
    allowBuyerCurrencySwitch: row.allowBuyerCurrencySwitch,
  };
}

export const getFinanceSettings = cache(async (): Promise<FinanceSettingsDto | null> => {
  const row = await prisma.financeSettings.findUnique({
    where: { id: FINANCE_SETTINGS_ID },
  });
  return row ? mapFinanceSettings(row) : null;
});
