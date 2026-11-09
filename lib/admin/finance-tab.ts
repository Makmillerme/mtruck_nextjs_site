export type FinanceTab =
  | "currencies"
  | "pricing"
  | "taxes"
  | "financing";

export const FINANCE_TABS: FinanceTab[] = [
  "currencies",
  "pricing",
  "taxes",
  "financing",
];

export function parseFinanceTab(value?: string | null): FinanceTab {
  if (value && (FINANCE_TABS as string[]).includes(value)) {
    return value as FinanceTab;
  }
  return "currencies";
}
