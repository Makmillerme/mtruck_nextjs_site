import { formatProductPrice } from "@/lib/catalog/product-page";
import type { DisplayMoney } from "@/lib/finance/types";

export function formatDisplayMoneyLabel(
  display: DisplayMoney,
  locale = "uk"
): string {
  return formatProductPrice(display.amount, locale, display.currencyCode);
}
