"use client";

import { CatalogMenuSelect } from "@/components/admin/catalog/catalog-fields";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  blurNumberInputOnWheel,
  numberInputClassName,
} from "@/lib/ui/number-input";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

const PRICE_NAME = "price";
const CURRENCY_NAME = "currency";

const CURRENCY_OPTIONS = [
  { value: "USD", label: "$" },
  { value: "EUR", label: "€" },
  { value: "UAH", label: "₴" },
] as const;

type PriceInputProps = {
  defaultValue?: number;
  defaultCurrency?: string;
};

function PriceInput({
  defaultValue,
  defaultCurrency = "USD",
}: PriceInputProps) {
  const t = useTranslations("Admin");

  return (
    <div className="grid gap-2">
      <Label htmlFor={PRICE_NAME}>{t("price")}</Label>
      <div className="flex items-stretch gap-2">
        <Input
          id={PRICE_NAME}
          type="number"
          name={PRICE_NAME}
          min={0}
          step={1}
          defaultValue={defaultValue ?? 100}
          required
          className={cn("min-w-0 flex-1", numberInputClassName)}
          onWheel={blurNumberInputOnWheel}
        />
        <CatalogMenuSelect
          name={CURRENCY_NAME}
          label={t("currency")}
          hideLabel
          required
          allowClear={false}
          defaultValue={defaultCurrency}
          options={[...CURRENCY_OPTIONS]}
          className="w-[4.75rem] shrink-0"
          placeholder="$"
          searchPlaceholder={t("currency")}
          emptyLabel="—"
        />
      </div>
    </div>
  );
}

export default PriceInput;
