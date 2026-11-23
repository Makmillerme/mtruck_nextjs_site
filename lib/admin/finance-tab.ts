export type FinanceTab = "currencies" | "pricing" | "financing";

export const FINANCE_TABS: FinanceTab[] = [
  "currencies",
  "pricing",
  "financing",
];

export function parseFinanceTab(value?: string | null): FinanceTab {
  if (value === "taxes") return "pricing";
  if (value && (FINANCE_TABS as string[]).includes(value)) {
    return value as FinanceTab;
  }
  return "currencies";
}
