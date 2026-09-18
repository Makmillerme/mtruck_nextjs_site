import type { CatalogAttribute, SheetWidthName } from "./types";

const WIDTH_SPAN: Record<SheetWidthName, number> = {
  FULL: 6,
  HALF: 3,
  THIRD: 2,
};

export const SHEET_WIDTH_CLASS: Record<SheetWidthName, string> = {
  FULL: "col-span-6",
  HALF: "col-span-6 sm:col-span-3",
  THIRD: "col-span-6 sm:col-span-2",
};

export type SheetLayoutItem = {
  attribute: CatalogAttribute;
  span: number;
  className: string;
};

/**
 * Pack attributes into rows of budget 6 (FULL=6, HALF=3, THIRD=2).
 * If the next field does not fit the remaining budget, start a new row.
 */
export function packSheetAttributes(
  attributes: CatalogAttribute[]
): SheetLayoutItem[] {
  let remaining = 6;
  return attributes.map((attribute) => {
    const width = attribute.sheetWidth ?? "FULL";
    const span = WIDTH_SPAN[width] ?? 6;
    if (span > remaining) {
      remaining = 6;
    }
    remaining -= span;
    if (remaining <= 0) {
      remaining = 6;
    }
    return {
      attribute,
      span,
      className: SHEET_WIDTH_CLASS[width] ?? SHEET_WIDTH_CLASS.FULL,
    };
  });
}
