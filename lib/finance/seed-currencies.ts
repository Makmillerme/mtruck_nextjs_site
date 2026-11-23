import type { PrismaClient } from "@prisma/client";

/** Currencies are added in Finance admin. Nothing is inserted for a country. */
export async function ensureFinanceCurrencies(_prisma: PrismaClient) {
  return;
}
