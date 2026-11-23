import { getTranslations } from "next-intl/server";
import { formatProductPrice } from "@/lib/catalog/product-page";
import { estimateMonthlyFinancing } from "@/lib/finance/financing-estimate";
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

  let financingLabel: string | null = null;
  let financingAmountLabel: string | null = null;
  if (display.financingEnabled) {
    const main = display.lines.find((line) => line.kind === "main");
    if (main) {
      const monthly = estimateMonthlyFinancing(main.amount);
      const amount = formatProductPrice(
        monthly,
        locale,
        main.currencyCode,
        display.currencyDisplayMode
      );
      financingLabel = tProduct("financingFrom");
      financingAmountLabel = tProduct("financingPerMonth", { amount });
    }
  }

  if (display.priceHint === "rateMissing") {
    return {
      ...display,
      priceHint: tFinance("rateMissingHint"),
      financingLabel,
      financingAmountLabel,
    };
  }
  // Mode captions (Вартість / з ПДВ / без ПДВ) removed from storefront canon.
  return {
    ...display,
    priceHint: null,
    financingLabel,
    financingAmountLabel,
  };
}
