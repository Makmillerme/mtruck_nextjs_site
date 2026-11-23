import { Decimal } from "@prisma/client/runtime/library";
import type { PromoKind } from "@/lib/finance/types";

export type ParsedPromo = {
  kind: PromoKind;
  value: Decimal;
} | null;

/**
 * Empty → no promo. Text with `%` → percent off. Otherwise absolute amount
 * in the same currency as the product price.
 */
export function parsePromoInput(raw: unknown): ParsedPromo {
  const text = String(raw ?? "").trim();
  if (!text) return null;
  const isPercent = text.includes("%");
  const numeric = text.replace(/%/g, "").replace(/,/g, ".").trim();
  if (!numeric || Number.isNaN(Number(numeric))) {
    throw new Error("INVALID_PROMO");
  }
  const value = new Decimal(numeric);
  if (value.lte(0)) throw new Error("INVALID_PROMO");
  if (isPercent && value.gt(100)) throw new Error("INVALID_PROMO");
  return { kind: isPercent ? "PERCENT" : "AMOUNT", value };
}

export function applyPromo(
  price: number,
  promo: { kind: PromoKind; value: Decimal | number | string } | null | undefined
): number {
  if (!promo) return price;
  const base = new Decimal(price);
  const value = new Decimal(promo.value);
  if (promo.kind === "PERCENT") {
    const next = base.mul(new Decimal(100).minus(value)).div(100);
    return Math.max(0, Math.round(next.toNumber()));
  }
  return Math.max(0, Math.round(base.minus(value).toNumber()));
}
