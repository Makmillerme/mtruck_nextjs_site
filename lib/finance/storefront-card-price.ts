import { getTranslations } from "next-intl/server";
import { formatProductPrice } from "@/lib/catalog/product-page";
import { lowerDefaultMonthly } from "@/lib/finance/financing-quote";
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
  let financingExtraLabels: string[] = [];
  const offer = display.financingOffer;
  if (display.financingEnabled && offer) {
    const monthly = lowerDefaultMonthly(
      offer.baseAmount,
      offer.credit,
      offer.lease
    );
    const main = offer.lines[0];
    if (main && monthly > 0) {
      const amount = formatProductPrice(
        monthly,
        locale,
        main.currencyCode,
        display.currencyDisplayMode
      );
      financingLabel = tProduct("financingFrom");
      financingAmountLabel = tProduct("financingPerMonth", { amount });
      financingExtraLabels = offer.lines.slice(1).map((line) =>
        formatProductPrice(
          monthly * line.perMain,
          locale,
          line.currencyCode,
          display.currencyDisplayMode
        )
      );
    }
  }

  if (display.priceHint === "rateMissing") {
    return {
      ...display,
      priceHint: tFinance("rateMissingHint"),
      financingLabel,
      financingAmountLabel,
      financingExtraLabels,
    };
  }
  return {
    ...display,
    priceHint: null,
    financingLabel,
    financingAmountLabel,
    financingExtraLabels,
  };
}
