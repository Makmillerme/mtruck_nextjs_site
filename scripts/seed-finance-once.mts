import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_CURRENCIES = [
  {
    code: "UAH",
    name: "Українська гривня",
    nameEn: "Ukrainian hryvnia",
    numericCode: 980,
    minorUnits: 2,
    isActive: true,
    isBuyerVisible: true,
    rateToBase: new Prisma.Decimal(1),
    rateUpdatedAt: new Date(),
    sortOrder: 0,
  },
  {
    code: "USD",
    name: "Долар США",
    nameEn: "US Dollar",
    numericCode: 840,
    minorUnits: 2,
    isActive: true,
    isBuyerVisible: true,
    rateToBase: null as Prisma.Decimal | null,
    rateUpdatedAt: null as Date | null,
    sortOrder: 1,
  },
  {
    code: "EUR",
    name: "Євро",
    nameEn: "Euro",
    numericCode: 978,
    minorUnits: 2,
    isActive: true,
    isBuyerVisible: true,
    rateToBase: null as Prisma.Decimal | null,
    rateUpdatedAt: null as Date | null,
    sortOrder: 2,
  },
];

try {
  for (const row of DEFAULT_CURRENCIES) {
    await prisma.currency.upsert({
      where: { code: row.code },
      create: row,
      update: {
        name: row.name,
        nameEn: row.nameEn,
        numericCode: row.numericCode,
        minorUnits: row.minorUnits,
      },
    });
  }

  const existing = await prisma.financeSettings.findUnique({
    where: { id: "default" },
  });
  if (!existing) {
    await prisma.financeSettings.create({
      data: {
        id: "default",
        baseCurrencyCode: "UAH",
        siteCurrencyCode: "UAH",
        allowBuyerCurrencySwitch: false,
      },
    });
  }

  await prisma.currency.update({
    where: { code: "UAH" },
    data: {
      rateToBase: new Prisma.Decimal(1),
      rateUpdatedAt: new Date(),
      isActive: true,
    },
  });

  console.log("finance seed ok", await prisma.currency.findMany({ select: { code: true } }));
} finally {
  await prisma.$disconnect();
}
