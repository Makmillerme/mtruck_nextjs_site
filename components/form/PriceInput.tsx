"use client";

import { useMemo, useState } from "react";
import { CatalogMenuSelect } from "@/components/admin/catalog/catalog-fields";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/navigation";
import { convertViaBasePlain } from "@/lib/finance/convert-plain";
import { applyPromoPreview } from "@/lib/finance/promo-format";
import type { PriceEntryMode } from "@/lib/finance/types";
import { splitVat } from "@/lib/finance/vat";
import {
  blurNumberInputOnWheel,
  numberInputClassName,
} from "@/lib/ui/number-input";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";

const PRICE_NAME = "price";
const CURRENCY_NAME = "currency";
const PROMO_NAME = "promo";

type PriceInputProps = {
  defaultValue?: number;
  defaultCurrency?: string;
  defaultPromo?: string;
  currencyOptions: { value: string; label: string }[];
  entryMode?: PriceEntryMode | null;
  vatEnabled?: boolean;
  vatPercent?: number;
  vatDisplayCurrencyCode?: string | null;
  ratesByCode?: Record<string, number | null | undefined>;
  minorUnitsByCode?: Record<string, number>;
};

function formatMoneyPreview(
  amount: number | null,
  currencyCode: string,
  locale: string,
  rateMissing: string
): string {
  if (amount == null) return rateMissing;
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount} ${currencyCode}`;
  }
}

function PriceInput({
  defaultValue,
  defaultCurrency = "",
  defaultPromo = "",
  currencyOptions,
  entryMode = "INCL_VAT",
  vatEnabled = false,
  vatPercent = 0,
  vatDisplayCurrencyCode = null,
  ratesByCode = {},
  minorUnitsByCode = {},
}: PriceInputProps) {
  const t = useTranslations("Admin");
  const locale = useLocale();
  const mode = entryMode ?? "INCL_VAT";
  const priceLabel = !vatEnabled
    ? t("pricePlain")
    : mode === "EXCL_VAT"
      ? t("priceExclVat")
      : t("priceInclVat");

  const [priceText, setPriceText] = useState(() =>
    String(defaultValue ?? 100)
  );
  const [currency, setCurrency] = useState(
    () => defaultCurrency || currencyOptions[0]?.value || ""
  );
  const [promoText, setPromoText] = useState(defaultPromo);

  const vatCurrency = (
    vatDisplayCurrencyCode || currency || ""
  ).toUpperCase();

  const currenciesDiffer =
    Boolean(currency) &&
    Boolean(vatCurrency) &&
    currency.toUpperCase() !== vatCurrency;

  const derived = useMemo(() => {
    const empty = {
      gross: null as number | null,
      net: null as number | null,
      vat: null as number | null,
      complement: null as number | null,
    };
    if (!vatEnabled || !currency) return empty;
    const price = Number(priceText);
    if (!Number.isFinite(price) || price < 0) return empty;
    const sale = applyPromoPreview(price, promoText);
    const breakdown = splitVat(sale, mode, vatPercent, 0);
    const minor = minorUnitsByCode[vatCurrency] ?? 2;
    const convert = (amount: number) =>
      convertViaBasePlain(
        amount,
        currency,
        vatCurrency,
        ratesByCode,
        minor
      );
    const gross = convert(breakdown.gross);
    const net = convert(breakdown.net);
    const vatAmount = convert(breakdown.vat);
    const complement = mode === "INCL_VAT" ? net : gross;
    return { gross, net, vat: vatAmount, complement };
  }, [
    vatEnabled,
    currency,
    priceText,
    promoText,
    mode,
    vatPercent,
    vatCurrency,
    ratesByCode,
    minorUnitsByCode,
  ]);

  if (currencyOptions.length === 0) {
    return (
      <div className="grid gap-2">
        <Label htmlFor={PRICE_NAME}>{priceLabel}</Label>
        <Input
          id={PRICE_NAME}
          type="text"
          disabled
          readOnly
          placeholder="—"
          className={cn("min-w-0", numberInputClassName)}
        />
        <p className="text-sm text-muted-foreground">
          {t("priceNeedsCurrency")}{" "}
          <Link
            href="/admin/finance"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            {t("finance")}
          </Link>
        </p>
      </div>
    );
  }

  const rateMissing = t("vatRateMissing");
  const complementLabel =
    mode === "INCL_VAT" ? t("priceWithoutVatField") : t("priceWithVatField");

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor={PRICE_NAME}>{priceLabel}</Label>
        <div className="flex items-stretch gap-2">
          <Input
            id={PRICE_NAME}
            type="number"
            name={PRICE_NAME}
            min={0}
            step={1}
            value={priceText}
            required
            className={cn("min-w-0 flex-1", numberInputClassName)}
            onWheel={blurNumberInputOnWheel}
            onChange={(event) => setPriceText(event.target.value)}
          />
          <CatalogMenuSelect
            name={CURRENCY_NAME}
            label={t("currency")}
            hideLabel
            required
            allowClear={false}
            searchable={currencyOptions.length > 5}
            value={currency}
            onValueChange={setCurrency}
            options={currencyOptions}
            className="w-[6.5rem] shrink-0"
            triggerClassName="px-3 tracking-normal"
            placeholder={currency}
            searchPlaceholder={t("currency")}
            emptyLabel="—"
          />
        </div>
      </div>

      {vatEnabled ? (
        currenciesDiffer ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="vat-net">{t("priceWithoutVatField")}</Label>
              <Input
                id="vat-net"
                type="text"
                readOnly
                tabIndex={-1}
                value={formatMoneyPreview(
                  derived.net,
                  vatCurrency,
                  locale,
                  rateMissing
                )}
                className={cn("min-w-0 bg-muted/40", numberInputClassName)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="vat-amount">{t("vatAmountField")}</Label>
              <Input
                id="vat-amount"
                type="text"
                readOnly
                tabIndex={-1}
                value={formatMoneyPreview(
                  derived.vat,
                  vatCurrency,
                  locale,
                  rateMissing
                )}
                className={cn("min-w-0 bg-muted/40", numberInputClassName)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="vat-gross">{t("priceWithVatField")}</Label>
              <Input
                id="vat-gross"
                type="text"
                readOnly
                tabIndex={-1}
                value={formatMoneyPreview(
                  derived.gross,
                  vatCurrency,
                  locale,
                  rateMissing
                )}
                className={cn("min-w-0 bg-muted/40", numberInputClassName)}
              />
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="vat-complement">{complementLabel}</Label>
              <Input
                id="vat-complement"
                type="text"
                readOnly
                tabIndex={-1}
                value={formatMoneyPreview(
                  derived.complement,
                  vatCurrency,
                  locale,
                  rateMissing
                )}
                className={cn("min-w-0 bg-muted/40", numberInputClassName)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="vat-amount">{t("vatAmountField")}</Label>
              <Input
                id="vat-amount"
                type="text"
                readOnly
                tabIndex={-1}
                value={formatMoneyPreview(
                  derived.vat,
                  vatCurrency,
                  locale,
                  rateMissing
                )}
                className={cn("min-w-0 bg-muted/40", numberInputClassName)}
              />
            </div>
          </div>
        )
      ) : null}

      <div className="grid gap-2">
        <Label htmlFor={PROMO_NAME}>{t("promo")}</Label>
        <Input
          id={PROMO_NAME}
          name={PROMO_NAME}
          type="text"
          inputMode="decimal"
          value={promoText}
          onChange={(event) => setPromoText(event.target.value)}
          placeholder="10% / 500"
          className={cn("min-w-0", numberInputClassName)}
        />
        <p className="text-xs text-muted-foreground">{t("promoHint")}</p>
      </div>
    </div>
  );
}

export default PriceInput;
