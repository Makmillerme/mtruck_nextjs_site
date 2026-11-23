import { formatProductPrice } from "@/lib/catalog/product-page";
import type {
  CurrencyDisplayMode,
  DisplayMoney,
} from "@/lib/finance/types";

export function formatDisplayMoneyLabel(
  display: DisplayMoney,
  locale = "uk",
  displayMode: CurrencyDisplayMode = "CODE"
): string {
  return formatProductPrice(
    display.amount,
    locale,
    display.currencyCode,
    displayMode
  );
}
