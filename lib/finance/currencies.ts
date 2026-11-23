import { cache } from "react";
import { Prisma } from "@prisma/client";
import prisma from "@/utils/db";
import { getIsoCurrency } from "@/lib/finance/iso-4217";
import { getFinanceSettings } from "@/lib/finance/settings";
import type { CurrencyDto } from "@/lib/finance/types";

export function mapCurrency(row: {
  code: string;
  name: string;
  nameEn: string;
  numericCode: number | null;
  minorUnits: number;
  isActive: boolean;
  isBuyerVisible: boolean;
  rateToBase: Prisma.Decimal | null;
  rateUpdatedAt: Date | null;
  sortOrder: number;
}): CurrencyDto {
  return {
    code: row.code,
    name: row.name,
    nameEn: row.nameEn,
    numericCode: row.numericCode,
    minorUnits: row.minorUnits,
    isActive: row.isActive,
    isBuyerVisible: row.isBuyerVisible,
    rateToBase: row.rateToBase,
    rateUpdatedAt: row.rateUpdatedAt,
    sortOrder: row.sortOrder,
  };
}

export const listCurrencies = cache(async (): Promise<
  Array<CurrencyDto & { productCount: number }>
> => {
  const [rows, usage] = await Promise.all([
    prisma.currency.findMany({
      orderBy: [{ sortOrder: "asc" }, { code: "asc" }],
    }),
    prisma.product.groupBy({
      by: ["currency"],
      _count: { _all: true },
    }),
  ]);
  const counts = new Map(usage.map((row) => [row.currency, row._count._all]));
  return rows.map((row) => ({
    ...mapCurrency(row),
    productCount: counts.get(row.code) ?? 0,
  }));
});

export const listActiveCurrencies = cache(async (): Promise<CurrencyDto[]> => {
  const all = await listCurrencies();
  return all.filter((c) => c.isActive);
});

export const listBuyerVisibleCurrencies = cache(async (): Promise<CurrencyDto[]> => {
  const all = await listCurrencies();
  return all.filter((c) => c.isActive);
});

export async function getCurrencyRatesMap(): Promise<
  Record<string, Prisma.Decimal | null>
> {
  const rows = await listCurrencies();
  const map: Record<string, Prisma.Decimal | null> = {};
  for (const row of rows) {
    map[row.code] = row.rateToBase;
  }
  return map;
}

export type UpsertCurrencyInput = {
  code: string;
  isActive: boolean;
  isBuyerVisible: boolean;
  rateToBase?: string | null;
};

export async function createCurrencyFromIso(input: UpsertCurrencyInput) {
  const code = input.code.toUpperCase();
  const iso = getIsoCurrency(code);
  if (!iso) {
    throw new Error("UNKNOWN_ISO_CURRENCY");
  }
  const existing = await prisma.currency.findUnique({ where: { code } });
  if (existing) {
    throw new Error("CURRENCY_DUPLICATE");
  }

  const settings = await getFinanceSettings();
  const isFirst = !settings;
  const isBase = !settings || code === settings.baseCurrencyCode;
  let rate: Prisma.Decimal | null = null;
  if (isBase) {
    rate = new Prisma.Decimal(1);
  } else if (input.rateToBase != null && input.rateToBase !== "") {
    rate = new Prisma.Decimal(input.rateToBase);
    if (rate.lte(0)) throw new Error("INVALID_RATE");
  }

  const maxSort = await prisma.currency.aggregate({ _max: { sortOrder: true } });
  const created = await prisma.currency.create({
    data: {
      code,
      name: iso.name,
      nameEn: iso.nameEn,
      numericCode: iso.numericCode,
      minorUnits: iso.minorUnits,
      isActive: isFirst ? true : input.isActive,
      isBuyerVisible: true,
      rateToBase: rate,
      rateUpdatedAt: rate != null ? new Date() : null,
      sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
    },
  });

  if (isFirst) {
    await prisma.financeSettings.create({
      data: {
        id: "default",
        baseCurrencyCode: code,
        siteCurrencyCode: code,
        allowBuyerCurrencySwitch: false,
      },
    });
  }

  return created;
}

export async function updateCurrency(input: UpsertCurrencyInput) {
  const code = input.code.toUpperCase();
  const existing = await prisma.currency.findUnique({ where: { code } });
  if (!existing) {
    throw new Error("CURRENCY_NOT_FOUND");
  }

  const settings = await getFinanceSettings();
  const isBase = settings?.baseCurrencyCode === code;

  if (!input.isActive && isBase) {
    throw new Error("CANNOT_DISABLE_PROTECTED_CURRENCY");
  }

  let rate: Prisma.Decimal | null | undefined = undefined;
  let rateUpdatedAt: Date | null | undefined = undefined;

  if (isBase) {
    rate = new Prisma.Decimal(1);
    rateUpdatedAt = new Date();
  } else if (input.rateToBase === null || input.rateToBase === "") {
    rate = null;
    rateUpdatedAt = null;
  } else if (input.rateToBase != null) {
    rate = new Prisma.Decimal(input.rateToBase);
    if (rate.lte(0)) throw new Error("INVALID_RATE");
    rateUpdatedAt = new Date();
  }

  return prisma.currency.update({
    where: { code },
    data: {
      isActive: input.isActive,
      isBuyerVisible: true,
      ...(rate !== undefined ? { rateToBase: rate, rateUpdatedAt } : {}),
    },
  });
}

export type UpdateFinanceSettingsInput = {
  baseCurrencyCode: string;
  siteCurrencyCode: string;
  allowBuyerCurrencySwitch: boolean;
  currencyDisplayMode: "CODE" | "SYMBOL";
};

export async function updateFinanceSettings(input: UpdateFinanceSettingsInput) {
  const base = input.baseCurrencyCode.toUpperCase();
  const baseRow = await prisma.currency.findUnique({ where: { code: base } });
  if (!baseRow) {
    throw new Error("CURRENCY_NOT_FOUND");
  }

  const current = await getFinanceSettings();
  if (!current) {
    throw new Error("CURRENCY_NOT_FOUND");
  }
  const baseChanged = current.baseCurrencyCode !== base;

  return prisma.$transaction(async (tx) => {
    if (baseChanged) {
      await tx.currency.updateMany({
        where: { code: { not: base } },
        data: { rateToBase: null, rateUpdatedAt: null },
      });
    }

    await tx.currency.updateMany({
      data: { isBuyerVisible: true },
    });
    await tx.currency.update({
      where: { code: base },
      data: {
        rateToBase: new Prisma.Decimal(1),
        rateUpdatedAt: new Date(),
        isActive: true,
        isBuyerVisible: true,
      },
    });

    return tx.financeSettings.update({
      where: { id: "default" },
      data: {
        baseCurrencyCode: base,
        siteCurrencyCode: base,
        allowBuyerCurrencySwitch: input.allowBuyerCurrencySwitch,
        currencyDisplayMode: input.currencyDisplayMode,
      },
    });
  });
}

export async function deleteCurrency(code: string) {
  const normalized = code.trim().toUpperCase();
  const existing = await prisma.currency.findUnique({
    where: { code: normalized },
  });
  if (!existing) {
    throw new Error("CURRENCY_NOT_FOUND");
  }

  const settings = await getFinanceSettings();
  if (settings && normalized === settings.baseCurrencyCode) {
    throw new Error("CANNOT_DELETE_PROTECTED_CURRENCY");
  }

  const used = await prisma.product.count({
    where: { currency: normalized },
  });
  if (used > 0) {
    throw new Error("CURRENCY_IN_USE");
  }

  await prisma.currency.delete({ where: { code: normalized } });
}
