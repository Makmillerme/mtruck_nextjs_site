import { Badge } from "@/components/ui/badge";
import { getTranslations } from "next-intl/server";

type CurrencyRow = {
  code: string;
  nameKey: "currencyUahName" | "currencyUsdName" | "currencyEurName";
  hintKey: "currencyUahHint" | "rateNotSet";
  badgeKey: "badgePrimary" | "badgeActive";
};

const CURRENCY_ROWS: CurrencyRow[] = [
  {
    code: "UAH",
    nameKey: "currencyUahName",
    hintKey: "currencyUahHint",
    badgeKey: "badgePrimary",
  },
  {
    code: "USD",
    nameKey: "currencyUsdName",
    hintKey: "rateNotSet",
    badgeKey: "badgeActive",
  },
  {
    code: "EUR",
    nameKey: "currencyEurName",
    hintKey: "rateNotSet",
    badgeKey: "badgeActive",
  },
];

export default async function FinanceCurrenciesPanel() {
  const t = await getTranslations("FinanceAdmin");

  return (
    <ul className="grid gap-3">
      {CURRENCY_ROWS.map((row) => (
        <li
          key={row.code}
          className="flex min-w-0 items-center justify-between gap-3 rounded-sm border border-border px-4 py-3"
        >
          <div className="grid min-w-0 gap-0.5">
            <p className="truncate text-sm font-semibold tracking-tight">
              {t(row.nameKey)}
            </p>
            <p className="truncate text-sm text-muted-foreground">
              {t(row.hintKey)}
            </p>
          </div>
          <Badge variant="soft" className="shrink-0">
            {t(row.badgeKey)}
          </Badge>
        </li>
      ))}
    </ul>
  );
}
