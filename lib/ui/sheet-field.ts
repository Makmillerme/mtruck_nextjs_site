import { de, enGB, uk } from "react-day-picker/locale";

/** Shared Sheet field trigger — admin + cabinet (combobox look). */
export const sheetFieldTriggerClassName =
  "h-11 w-full justify-between font-normal";

/**
 * 1px inset inside overflow-auto/hidden ancestors so Input/Button borders
 * and focus rings are not clipped at the scrollport edge.
 */
export const overflowFieldGutterClassName = "p-px";

/**
 * Scroll body for sheet/filter stacks with sticky footers.
 * Pair with a shrink-0 footer sibling in a flex-col min-h-0 parent.
 */
export const sheetScrollBodyClassName =
  "min-h-0 flex-1 overflow-x-clip overflow-y-auto p-px";

/** Map next-intl app locale → react-day-picker locale object. */
export function getDayPickerLocale(appLocale: string) {
  if (appLocale === "de") return de;
  if (appLocale === "en") return enGB;
  return uk;
}

/** BCP 47 tag for Intl date/number formatting (calendar trigger, etc.). */
export function getIntlLocale(appLocale: string): string {
  if (appLocale === "de") return "de-DE";
  if (appLocale === "en") return "en-GB";
  return "uk-UA";
}
