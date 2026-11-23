import type { PromoKind } from "@/lib/finance/types";

/** Client-safe formatting for the product promo input. */
export function formatPromoInput(
  kind: PromoKind | null | undefined,
  value: string | number | null | undefined
): string {
  if (!kind || value == null || value === "") return "";
  const num = Number(value);
  if (!Number.isFinite(num)) return "";
  const plain = String(num);
  const trimmed = plain.replace(/(\.\d*?[1-9])0+$|\.0+$/, "$1");
  return kind === "PERCENT" ? `${trimmed}%` : trimmed;
}

/** Client-safe promo preview for live VAT fields (invalid input → ignore). */
export function applyPromoPreview(price: number, raw: string): number {
  const text = String(raw ?? "").trim();
  if (!text || !Number.isFinite(price)) return price;
  const isPercent = text.includes("%");
  const numeric = Number(text.replace(/%/g, "").replace(/,/g, ".").trim());
  if (!Number.isFinite(numeric) || numeric <= 0) return price;
  if (isPercent) {
    const pct = Math.min(numeric, 100);
    return Math.max(0, Math.round((price * (100 - pct)) / 100));
  }
  return Math.max(0, Math.round(price - numeric));
}
