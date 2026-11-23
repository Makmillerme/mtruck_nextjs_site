import { Decimal } from "@prisma/client/runtime/library";

export type RateMap = Record<string, Decimal | null | undefined>;

function toDecimal(value: number | string | Decimal): Decimal {
  if (value instanceof Decimal) return value;
  return new Decimal(value);
}

export function roundMoney(amount: Decimal, minorUnits: number): Decimal {
  return amount.toDecimalPlaces(minorUnits, Decimal.ROUND_HALF_UP);
}

/**
 * Stored quote: 1 unit of the main currency = quote units of this currency.
 * The main currency quote is always 1. Other currencies have no quote until it is set.
 * amount_to = amount_from * quoteTo / quoteFrom.
 * Returns null if either quote is missing (except identity).
 */
export function convertViaBase(
  amount: number | string | Decimal,
  fromCode: string,
  toCode: string,
  rates: RateMap,
  toMinorUnits = 2
): Decimal | null {
  if (!fromCode || !toCode) return null;
  const from = fromCode.toUpperCase();
  const to = toCode.toUpperCase();
  const value = toDecimal(amount);

  if (from === to) {
    return roundMoney(value, toMinorUnits);
  }

  const quoteFrom = rates[from];
  const quoteTo = rates[to];
  if (quoteFrom == null || quoteTo == null || quoteFrom.isZero()) {
    return null;
  }

  const converted = value.mul(quoteTo).div(quoteFrom);
  return roundMoney(converted, toMinorUnits);
}
