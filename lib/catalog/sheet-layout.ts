import type { CatalogAttribute, SheetWidthName } from "./types";

const WIDTH_SPAN: Record<SheetWidthName, number> = {
  FULL: 6,
  HALF: 3,
  THIRD: 2,
};

export const SHEET_WIDTH_CLASS: Record<SheetWidthName, string> = {
  FULL: "col-span-6",
  HALF: "col-span-3",
  THIRD: "col-span-2",
};

export type SheetLayoutItem = {
  attribute: CatalogAttribute;
  span: number;
  className: string;
};

function attributeSpan(attribute: CatalogAttribute): number {
  const width = attribute.sheetWidth ?? "FULL";
  return WIDTH_SPAN[width] ?? 6;
}

function depsPlaced(
  attribute: CatalogAttribute,
  placed: Set<string>
): boolean {
  return (
    !attribute.dependsOnAttributeId ||
    placed.has(attribute.dependsOnAttributeId)
  );
}

/**
 * Shelf-pack attributes into rows of budget 6 (FULL=6, HALF=3, THIRD=2).
 * Tries the queue head first; if it does not fit, looks ahead for the earliest
 * later field that fits and whose dependency is already placed. If none fit,
 * starts a new row and places the head. Preserves cascade order safety.
 */
export function packSheetAttributes(
  attributes: CatalogAttribute[]
): SheetLayoutItem[] {
  const queue = [...attributes];
  const placed = new Set<string>();
  const result: SheetLayoutItem[] = [];
  let remaining = 6;

  while (queue.length > 0) {
    let pickIndex = -1;
    const head = queue[0]!;
    const headSpan = attributeSpan(head);

    if (headSpan <= remaining && depsPlaced(head, placed)) {
      pickIndex = 0;
    } else {
      pickIndex = queue.findIndex(
        (attribute, index) =>
          index > 0 &&
          attributeSpan(attribute) <= remaining &&
          depsPlaced(attribute, placed)
      );
    }

    if (pickIndex === -1) {
      remaining = 6;
      pickIndex = 0;
    }

    const [attribute] = queue.splice(pickIndex, 1);
    const width = attribute.sheetWidth ?? "FULL";
    const span = attributeSpan(attribute);
    result.push({
      attribute,
      span,
      className: SHEET_WIDTH_CLASS[width] ?? SHEET_WIDTH_CLASS.FULL,
    });
    placed.add(attribute.id);
    remaining -= span;
    if (remaining <= 0) {
      remaining = 6;
    }
  }

  return result;
}
