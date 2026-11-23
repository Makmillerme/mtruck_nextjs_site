import prisma from "@/utils/db";

/** Active currencies may be set on products; inactive is allowed only if already on the product. */
export async function assertProductCurrency(
  code: string,
  previousCode?: string | null
) {
  const normalized = code.toUpperCase();
  const row = await prisma.currency.findUnique({ where: { code: normalized } });
  if (!row) {
    throw new Error("Unknown currency.");
  }
  if (!row.isActive && normalized !== previousCode?.toUpperCase()) {
    throw new Error("Currency is not active.");
  }
  return normalized;
}
