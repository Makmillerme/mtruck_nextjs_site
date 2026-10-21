import type { SpecCreateInput } from "@/lib/catalog/product-specs";
import type { Prisma } from "@prisma/client";

export type ExistingSpecRow = {
  id: string;
  attributeId: string;
  optionId: string | null;
  numberValue: number | null;
  textValue: string | null;
  booleanValue: boolean | null;
};

export type ImageOrderEntry =
  | { t: "e"; id?: string }
  | { t: "n" }
  | { t: "c" };

function sameNullableNumber(a: number | null | undefined, b: number | null | undefined) {
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;
  return a === b;
}

function sameNullableString(a: string | null | undefined, b: string | null | undefined) {
  return (a ?? null) === (b ?? null);
}

function sameNullableBool(a: boolean | null | undefined, b: boolean | null | undefined) {
  return (a ?? null) === (b ?? null);
}

function specEquals(existing: ExistingSpecRow, next: SpecCreateInput): boolean {
  return (
    sameNullableString(existing.optionId, next.optionId ?? null) &&
    sameNullableNumber(existing.numberValue, next.numberValue ?? null) &&
    sameNullableString(existing.textValue, next.textValue ?? null) &&
    sameNullableBool(existing.booleanValue, next.booleanValue ?? null)
  );
}

/** Diff form specs against DB — only create/update/delete changed attribute rows. */
export function diffProductSpecs(
  existing: ExistingSpecRow[],
  nextSpecs: SpecCreateInput[]
): {
  creates: Prisma.ProductSpecCreateWithoutProductInput[];
  updates: { id: string; data: Prisma.ProductSpecUpdateInput }[];
  deleteIds: string[];
  changed: boolean;
} {
  const byAttr = new Map(existing.map((row) => [row.attributeId, row]));
  const nextIds = new Set(nextSpecs.map((spec) => spec.attributeId));
  const creates: Prisma.ProductSpecCreateWithoutProductInput[] = [];
  const updates: { id: string; data: Prisma.ProductSpecUpdateInput }[] = [];

  for (const spec of nextSpecs) {
    const prev = byAttr.get(spec.attributeId);
    const data: Prisma.ProductSpecUpdateInput = {
      option: spec.optionId
        ? { connect: { id: spec.optionId } }
        : { disconnect: true },
      numberValue: spec.numberValue ?? null,
      textValue: spec.textValue ?? null,
      booleanValue: spec.booleanValue ?? null,
    };
    if (!prev) {
      creates.push({
        attribute: { connect: { id: spec.attributeId } },
        option: spec.optionId ? { connect: { id: spec.optionId } } : undefined,
        numberValue: spec.numberValue ?? undefined,
        textValue: spec.textValue ?? undefined,
        booleanValue: spec.booleanValue ?? undefined,
      });
      continue;
    }
    if (!specEquals(prev, spec)) {
      updates.push({ id: prev.id, data });
    }
  }

  const deleteIds = existing
    .filter((row) => !nextIds.has(row.attributeId))
    .map((row) => row.id);

  return {
    creates,
    updates,
    deleteIds,
    changed: creates.length > 0 || updates.length > 0 || deleteIds.length > 0,
  };
}

export function isImageOrderUnchanged(
  existingIdsInOrder: string[],
  imageOrder: ImageOrderEntry[],
  newFileCount: number
): boolean {
  if (newFileCount > 0) return false;
  if (imageOrder.some((entry) => entry.t === "n" || entry.t === "c")) {
    return false;
  }
  const orderIds = imageOrder
    .filter((entry): entry is { t: "e"; id: string } => entry.t === "e" && Boolean(entry.id))
    .map((entry) => entry.id);
  if (orderIds.length !== existingIdsInOrder.length) return false;
  return orderIds.every((id, index) => id === existingIdsInOrder[index]);
}
