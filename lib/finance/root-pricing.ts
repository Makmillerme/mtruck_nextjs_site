import { cache } from "react";
import { Prisma } from "@prisma/client";
import prisma from "@/utils/db";
import { getFinanceSettings } from "@/lib/finance/settings";
import type {
  PriceDisplayMode,
  PriceEntryMode,
  RootPricingDto,
} from "@/lib/finance/types";

function mapRootPricing(row: {
  taxonomyNodeId: string;
  vatEnabled: boolean;
  entryMode: PriceEntryMode;
  storefrontPriceMode: PriceEntryMode;
  vatPercent: Prisma.Decimal;
  showPriceWithVat: boolean;
  showPriceWithoutVat: boolean;
  showVatAmount: boolean;
  displayMode: PriceDisplayMode;
  mainCurrencyCode: string;
  vatDisplayCurrencyCode: string | null;
  allowBuyerCurrencySwitch: boolean;
  financingEnabled: boolean;
  extraCurrencies: { currencyCode: string; sortOrder: number }[];
}): RootPricingDto {
  return {
    taxonomyNodeId: row.taxonomyNodeId,
    vatEnabled: row.vatEnabled,
    entryMode: row.entryMode,
    storefrontPriceMode: row.storefrontPriceMode,
    vatPercent: Number(row.vatPercent),
    showPriceWithVat: row.showPriceWithVat,
    showPriceWithoutVat: row.showPriceWithoutVat,
    showVatAmount: row.showVatAmount,
    displayMode: row.displayMode,
    mainCurrencyCode: row.mainCurrencyCode,
    vatDisplayCurrencyCode: row.vatDisplayCurrencyCode,
    allowBuyerCurrencySwitch: row.allowBuyerCurrencySwitch,
    financingEnabled: row.financingEnabled,
    extraCurrencyCodes: [...row.extraCurrencies]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item) => item.currencyCode),
  };
}

const includeExtras = {
  extraCurrencies: {
    select: { currencyCode: true, sortOrder: true },
    orderBy: { sortOrder: "asc" as const },
  },
};

export const loadTaxonomyParentIndex = cache(async () => {
  const nodes = await prisma.taxonomyNode.findMany({
    select: { id: true, parentId: true },
  });
  return new Map(nodes.map((node) => [node.id, node.parentId]));
});

export function rootIdFromParentIndex(
  taxonomyNodeId: string | null | undefined,
  parents: Map<string, string | null>
): string | null {
  if (!taxonomyNodeId) return null;
  let current: string | null = taxonomyNodeId;
  const seen = new Set<string>();
  while (current) {
    if (seen.has(current)) return null;
    seen.add(current);
    if (!parents.has(current)) return null;
    const parentId: string | null = parents.get(current) ?? null;
    if (!parentId) return current;
    current = parentId;
  }
  return null;
}

export async function resolveTaxonomyRootId(
  taxonomyNodeId: string | null | undefined
): Promise<string | null> {
  const parents = await loadTaxonomyParentIndex();
  return rootIdFromParentIndex(taxonomyNodeId, parents);
}

export const listCatalogRoots = cache(async () => {
  return prisma.taxonomyNode.findMany({
    where: { parentId: null },
    select: { id: true, name: true, slug: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
});

export const listRootPricing = cache(async (): Promise<RootPricingDto[]> => {
  const rows = await prisma.rootPricing.findMany({
    include: includeExtras,
  });
  return rows.map(mapRootPricing);
});

export async function getRootPricingForProductNode(
  taxonomyNodeId: string | null | undefined
): Promise<RootPricingDto | null> {
  const rootId = await resolveTaxonomyRootId(taxonomyNodeId);
  if (!rootId) return null;
  const rows = await listRootPricing();
  return rows.find((row) => row.taxonomyNodeId === rootId) ?? null;
}

export async function defaultRootPricingDraft(
  taxonomyNodeId: string
): Promise<RootPricingDto> {
  const settings = await getFinanceSettings();
  const main =
    settings?.baseCurrencyCode ??
    (
      await prisma.currency.findFirst({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { code: "asc" }],
        select: { code: true },
      })
    )?.code ??
    "USD";
  return {
    taxonomyNodeId,
    vatEnabled: true,
    entryMode: "INCL_VAT",
    storefrontPriceMode: "INCL_VAT",
    vatPercent: 0,
    showPriceWithVat: true,
    showPriceWithoutVat: false,
    showVatAmount: false,
    displayMode: "SINGLE",
    mainCurrencyCode: main,
    vatDisplayCurrencyCode: main,
    allowBuyerCurrencySwitch: false,
    financingEnabled: true,
    extraCurrencyCodes: [],
  };
}

export type UpsertRootPricingInput = {
  taxonomyNodeId: string | "ALL";
  vatEnabled: boolean;
  entryMode: PriceEntryMode;
  storefrontPriceMode: PriceEntryMode;
  vatPercent: number;
  showPriceWithVat: boolean;
  showPriceWithoutVat: boolean;
  showVatAmount: boolean;
  displayMode: PriceDisplayMode;
  mainCurrencyCode: string;
  vatDisplayCurrencyCode: string | null;
  allowBuyerCurrencySwitch: boolean;
  extraCurrencyCodes: string[];
};

async function upsertOne(
  taxonomyNodeId: string,
  input: Omit<UpsertRootPricingInput, "taxonomyNodeId">
) {
  const main = input.mainCurrencyCode.toUpperCase();
  const vatDisplay = input.vatDisplayCurrencyCode
    ? input.vatDisplayCurrencyCode.toUpperCase()
    : main;
  const extras = [
    ...new Set(
      input.extraCurrencyCodes
        .map((code) => code.toUpperCase())
        .filter((code) => code && code !== main)
    ),
  ];

  const codes = [...new Set([main, vatDisplay, ...extras])];
  const found = await prisma.currency.findMany({
    where: { code: { in: codes }, isActive: true },
    select: { code: true },
  });
  if (found.length !== codes.length) {
    throw new Error("CURRENCY_NOT_FOUND");
  }

  const root = await prisma.taxonomyNode.findUnique({
    where: { id: taxonomyNodeId },
    select: { id: true, parentId: true },
  });
  if (!root || root.parentId) {
    throw new Error("ROOT_REQUIRED");
  }

  const allowSwitch =
    input.displayMode === "SINGLE" ? input.allowBuyerCurrencySwitch : false;

  const showPriceWithVat = input.vatEnabled && input.showPriceWithVat;
  const showPriceWithoutVat = input.vatEnabled && input.showPriceWithoutVat;
  const showVatAmount = input.vatEnabled && input.showVatAmount;

  return prisma.$transaction(async (tx) => {
    const row = await tx.rootPricing.upsert({
      where: { taxonomyNodeId },
      create: {
        taxonomyNodeId,
        vatEnabled: input.vatEnabled,
        entryMode: input.entryMode,
        storefrontPriceMode: input.storefrontPriceMode,
        vatPercent: new Prisma.Decimal(input.vatPercent),
        showPriceWithVat,
        showPriceWithoutVat,
        showVatAmount,
        displayMode: input.displayMode,
        mainCurrencyCode: main,
        vatDisplayCurrencyCode: vatDisplay,
        allowBuyerCurrencySwitch: allowSwitch,
      },
      update: {
        vatEnabled: input.vatEnabled,
        entryMode: input.entryMode,
        storefrontPriceMode: input.storefrontPriceMode,
        vatPercent: new Prisma.Decimal(input.vatPercent),
        showPriceWithVat,
        showPriceWithoutVat,
        showVatAmount,
        displayMode: input.displayMode,
        mainCurrencyCode: main,
        vatDisplayCurrencyCode: vatDisplay,
        allowBuyerCurrencySwitch: allowSwitch,
      },
    });

    await tx.rootPricingCurrency.deleteMany({
      where: { rootPricingId: row.id },
    });
    if (extras.length > 0) {
      await tx.rootPricingCurrency.createMany({
        data: extras.map((currencyCode, index) => ({
          rootPricingId: row.id,
          currencyCode,
          sortOrder: index,
        })),
      });
    }

    return row;
  });
}

export async function upsertRootPricing(input: UpsertRootPricingInput) {
  const payload = {
    vatEnabled: input.vatEnabled,
    entryMode: input.entryMode,
    storefrontPriceMode: input.storefrontPriceMode,
    vatPercent: input.vatPercent,
    showPriceWithVat: input.showPriceWithVat,
    showPriceWithoutVat: input.showPriceWithoutVat,
    showVatAmount: input.showVatAmount,
    displayMode: input.displayMode,
    mainCurrencyCode: input.mainCurrencyCode,
    vatDisplayCurrencyCode: input.vatDisplayCurrencyCode,
    allowBuyerCurrencySwitch: input.allowBuyerCurrencySwitch,
    extraCurrencyCodes: input.extraCurrencyCodes,
  };

  if (input.taxonomyNodeId === "ALL") {
    const roots = await listCatalogRoots();
    if (roots.length === 0) throw new Error("ROOT_REQUIRED");
    for (const root of roots) {
      await upsertOne(root.id, payload);
    }
    return;
  }

  await upsertOne(input.taxonomyNodeId, payload);
}

export async function setRootFinancingEnabled(
  taxonomyNodeId: string | "ALL",
  financingEnabled: boolean
) {
  if (taxonomyNodeId === "ALL") {
    const roots = await listCatalogRoots();
    if (roots.length === 0) throw new Error("ROOT_REQUIRED");
    for (const root of roots) {
      await setRootFinancingEnabledOne(root.id, financingEnabled);
    }
    return;
  }
  await setRootFinancingEnabledOne(taxonomyNodeId, financingEnabled);
}

async function setRootFinancingEnabledOne(
  taxonomyNodeId: string,
  financingEnabled: boolean
) {
  const root = await prisma.taxonomyNode.findUnique({
    where: { id: taxonomyNodeId },
    select: { id: true, parentId: true },
  });
  if (!root || root.parentId) {
    throw new Error("ROOT_REQUIRED");
  }

  const existing = await prisma.rootPricing.findUnique({
    where: { taxonomyNodeId },
    select: { id: true },
  });
  if (existing) {
    await prisma.rootPricing.update({
      where: { taxonomyNodeId },
      data: { financingEnabled },
    });
    return;
  }

  const draft = await defaultRootPricingDraft(taxonomyNodeId);
  await upsertOne(taxonomyNodeId, {
    vatEnabled: draft.vatEnabled,
    entryMode: draft.entryMode,
    storefrontPriceMode: draft.storefrontPriceMode,
    vatPercent: draft.vatPercent,
    showPriceWithVat: draft.showPriceWithVat,
    showPriceWithoutVat: draft.showPriceWithoutVat,
    showVatAmount: draft.showVatAmount,
    displayMode: draft.displayMode,
    mainCurrencyCode: draft.mainCurrencyCode,
    vatDisplayCurrencyCode: draft.vatDisplayCurrencyCode,
    allowBuyerCurrencySwitch: draft.allowBuyerCurrencySwitch,
    extraCurrencyCodes: draft.extraCurrencyCodes,
  });
  await prisma.rootPricing.update({
    where: { taxonomyNodeId },
    data: { financingEnabled },
  });
}

export const anyRootAllowsBuyerSwitch = cache(async (): Promise<boolean> => {
  const count = await prisma.rootPricing.count({
    where: {
      displayMode: "SINGLE",
      allowBuyerCurrencySwitch: true,
    },
  });
  return count > 0;
});
