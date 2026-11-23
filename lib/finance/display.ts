import { convertViaBase } from "@/lib/finance/convert";
import { getCurrencyRatesMap, listCurrencies } from "@/lib/finance/currencies";
import { getPrimaryPrice } from "@/lib/finance/product-price";
import { getFinanceSettings } from "@/lib/finance/settings";
import type { DisplayMoney, MoneyAmount } from "@/lib/finance/types";

export async function resolveDisplayMoney(options: {
  product: { price: number; currency: string };
  buyerCurrency?: string | null;
}): Promise<DisplayMoney> {
  const original = getPrimaryPrice(options.product);
  const settings = await getFinanceSettings();
  if (!settings) {
    return {
      amount: original.amount,
      currencyCode: original.currencyCode,
      converted: false,
      original,
    };
  }
  const currencies = await listCurrencies();
  const byCode = new Map(currencies.map((c) => [c.code, c]));

  let target = settings.baseCurrencyCode;
  if (
    settings.allowBuyerCurrencySwitch &&
    options.buyerCurrency
  ) {
    const buyer = options.buyerCurrency.toUpperCase();
    const row = byCode.get(buyer);
    if (row?.isActive) {
      target = buyer;
    }
  }

  return convertMoneyAmount(original, target);
}

export async function convertMoneyAmount(
  original: MoneyAmount,
  targetCode: string
): Promise<DisplayMoney> {
  const source = original.currencyCode?.trim().toUpperCase() || "";
  const target = targetCode?.trim().toUpperCase() || source;
  if (!source || !target) {
    return {
      amount: original.amount,
      currencyCode: source || target || "USD",
      converted: false,
      hintKey: "rateMissing",
      original,
    };
  }
  if (source === target) {
    return {
      amount: original.amount,
      currencyCode: target,
      converted: false,
      original: { ...original, currencyCode: source },
    };
  }

  const [rates, currencies] = await Promise.all([
    getCurrencyRatesMap(),
    listCurrencies(),
  ]);
  const minor =
    currencies.find((c) => c.code === target)?.minorUnits ?? 2;

  const converted = convertViaBase(
    original.amount,
    source,
    target,
    rates,
    minor
  );

  if (converted == null) {
    return {
      amount: original.amount,
      currencyCode: source,
      converted: false,
      hintKey: "rateMissing",
      original,
    };
  }

  return {
    amount: converted.toNumber(),
    currencyCode: target,
    converted: true,
    original,
  };
}
