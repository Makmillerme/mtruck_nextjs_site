/** Client-safe conversion using the same quote formula (no Prisma Decimal). */
export function convertViaBasePlain(
  amount: number,
  fromCode: string,
  toCode: string,
  rates: Record<string, number | null | undefined>,
  toMinorUnits = 2
): number | null {
  if (!fromCode || !toCode || !Number.isFinite(amount)) return null;
  const from = fromCode.toUpperCase();
  const to = toCode.toUpperCase();
  if (from === to) {
    if (toMinorUnits <= 0) return Math.round(amount);
    const factor = 10 ** toMinorUnits;
    return Math.round(amount * factor) / factor;
  }
  const quoteFrom = rates[from];
  const quoteTo = rates[to];
  if (quoteFrom == null || quoteTo == null || quoteFrom === 0) return null;
  const converted = (amount * quoteTo) / quoteFrom;
  if (toMinorUnits <= 0) return Math.round(converted);
  const factor = 10 ** toMinorUnits;
  return Math.round(converted * factor) / factor;
}
