import type { MoneyAmount } from "@/lib/finance/types";

/** Primary commercial price. Future multi-price will expand here. */
export function getPrimaryPrice(product: {
  price: number;
  currency: string;
}): MoneyAmount {
  return {
    amount: product.price,
    currencyCode: product.currency,
  };
}
