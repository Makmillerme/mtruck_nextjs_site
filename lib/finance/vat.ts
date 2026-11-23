import type { PriceEntryMode } from "@/lib/finance/types";

export type VatBreakdown = {
  net: number;
  gross: number;
  vat: number;
};

/** Client- and server-safe rounding (half-up for positive amounts). */
function roundMoney(value: number, minorUnits: number): number {
  if (!Number.isFinite(value)) return 0;
  if (minorUnits <= 0) return Math.round(value);
  const factor = 10 ** minorUnits;
  return Math.round(value * factor) / factor;
}

export function splitVat(
  amount: number,
  entryMode: PriceEntryMode,
  vatPercent: number,
  minorUnits = 0
): VatBreakdown {
  const rate = Number(vatPercent) / 100;
  const value = Number(amount);

  if (!Number.isFinite(rate) || rate === 0) {
    const same = roundMoney(value, minorUnits);
    return { net: same, gross: same, vat: 0 };
  }

  if (entryMode === "INCL_VAT") {
    const gross = roundMoney(value, minorUnits);
    const net = roundMoney(value / (1 + rate), minorUnits);
    return { net, gross, vat: roundMoney(gross - net, minorUnits) };
  }

  const net = roundMoney(value, minorUnits);
  const vat = roundMoney(value * rate, minorUnits);
  return { net, gross: roundMoney(net + vat, minorUnits), vat };
}
