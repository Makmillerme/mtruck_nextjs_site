import { getTranslations } from "next-intl/server";
import { buildStorefrontPriceDisplay } from "@/lib/finance/resolve-storefront-price";
import type { PromoKind, StorefrontPriceDisplay } from "@/lib/finance/types";
import type { Decimal } from "@prisma/client/runtime/library";

export async function resolveStorefrontPriceDisplay(
  product: {
    price: number;
    currency: string;
    taxonomyNodeId?: string | null;
    promoKind?: PromoKind | null;
    promoValue?: Decimal | number | string | null;
  },
  locale: string,
  buyerCurrency?: string | null
): Promise<StorefrontPriceDisplay> {
  const display = await buildStorefrontPriceDisplay(
    product,
    locale,
    buyerCurrency
  );
  const tFinance = await getTranslations({ locale, namespace: "FinanceAdmin" });
  const tProduct = await getTranslations({ locale, namespace: "Product" });
  if (display.priceHint === "rateMissing") {
    return {
      ...display,
      priceHint: tFinance("rateMissingHint"),
    };
  }
  // Different VAT currency: main amount speaks for itself — no caption.
  if (display.vatCurrenciesDiffer) {
    return {
      ...display,
      priceHint: null,
    };
  }
  // Same currency: short entry-mode caption without the word «Вартість».
  const modeHint =
    display.priceMode === "INCL_VAT"
      ? tProduct("priceHintInclShort")
      : display.priceMode === "EXCL_VAT"
        ? tProduct("priceHintExclShort")
        : tProduct("priceHintPlainShort");
  return {
    ...display,
    priceHint: modeHint,
  };
}
