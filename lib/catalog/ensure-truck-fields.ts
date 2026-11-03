import type { PrismaClient } from "@prisma/client";

const TRUCKS_SLUG = "vantazhni-avto";

async function ensureSelectOptions(
  prisma: PrismaClient,
  attributeId: string,
  options: { label: string; slug: string; parentOptionId?: string | null; sortOrder: number }[]
) {
  for (const option of options) {
    await prisma.attributeOption.upsert({
      where: {
        attributeId_slug: {
          attributeId,
          slug: option.slug,
        },
      },
      create: {
        attributeId,
        label: option.label,
        slug: option.slug,
        parentOptionId: option.parentOptionId ?? null,
        sortOrder: option.sortOrder,
      },
      update: {
        label: option.label,
        parentOptionId: option.parentOptionId ?? null,
        sortOrder: option.sortOrder,
      },
    });
  }
}

async function ensureAttribute(
  prisma: PrismaClient,
  taxonomyNodeId: string,
  data: {
    key: string;
    name: string;
    type: "SELECT" | "MULTI_SELECT" | "NUMBER" | "TEXT" | "BOOLEAN" | "YEAR";
    unit?: string | null;
    dependsOnAttributeId?: string | null;
    isFacet?: boolean;
    isRequired?: boolean;
    sortOrder: number;
  }
) {
  return prisma.attributeDefinition.upsert({
    where: {
      taxonomyNodeId_key: {
        taxonomyNodeId,
        key: data.key,
      },
    },
    create: {
      taxonomyNodeId,
      key: data.key,
      name: data.name,
      type: data.type,
      unit: data.unit ?? null,
      dependsOnAttributeId: data.dependsOnAttributeId ?? null,
      isFacet: data.isFacet ?? true,
      isRequired: data.isRequired ?? false,
      sortOrder: data.sortOrder,
    },
    update: {
      name: data.name,
      type: data.type,
      unit: data.unit ?? null,
      dependsOnAttributeId: data.dependsOnAttributeId ?? null,
      isFacet: data.isFacet ?? true,
      isRequired: data.isRequired ?? false,
      sortOrder: data.sortOrder,
    },
  });
}

/** Доповнює поля для «Вантажні авто» та «Контейнеровози» без дублювання ключів. */
export async function ensureTruckCatalogFields(prisma: PrismaClient) {
  const trucks = await prisma.taxonomyNode.findUnique({
    where: { slug: TRUCKS_SLUG },
  });
  if (!trucks) {
    throw new Error(`Folder «${TRUCKS_SLUG}» not found. Seed taxonomy first.`);
  }

  const make = await ensureAttribute(prisma, trucks.id, {
    key: "make",
    name: "Марка",
    type: "SELECT",
    isFacet: true,
    isRequired: true,
    sortOrder: 0,
  });
  const model = await ensureAttribute(prisma, trucks.id, {
    key: "model",
    name: "Модель",
    type: "SELECT",
    dependsOnAttributeId: make.id,
    isFacet: true,
    isRequired: true,
    sortOrder: 1,
  });
  await ensureAttribute(prisma, trucks.id, {
    key: "year",
    name: "Рік",
    type: "YEAR",
    isFacet: true,
    isRequired: true,
    sortOrder: 2,
  });
  await ensureAttribute(prisma, trucks.id, {
    key: "mileage",
    name: "Пробіг",
    type: "NUMBER",
    unit: "км",
    isFacet: true,
    sortOrder: 3,
  });
  await ensureAttribute(prisma, trucks.id, {
    key: "power_hp",
    name: "Потужність",
    type: "NUMBER",
    unit: "к.с.",
    isFacet: true,
    sortOrder: 4,
  });
  await ensureAttribute(prisma, trucks.id, {
    key: "euro",
    name: "Євронорма",
    type: "SELECT",
    isFacet: true,
    isRequired: true,
    sortOrder: 5,
  });
  await ensureAttribute(prisma, trucks.id, {
    key: "transmission",
    name: "КПП",
    type: "SELECT",
    isFacet: true,
    isRequired: true,
    sortOrder: 6,
  });
  await ensureAttribute(prisma, trucks.id, {
    key: "axle",
    name: "Колісна формула",
    type: "SELECT",
    isFacet: true,
    sortOrder: 7,
  });
  await ensureAttribute(prisma, trucks.id, {
    key: "location",
    name: "Локація",
    type: "TEXT",
    isFacet: true,
    sortOrder: 8,
  });
  await ensureAttribute(prisma, trucks.id, {
    key: "feature",
    name: "Особливість",
    type: "TEXT",
    isFacet: false,
    sortOrder: 9,
  });
  const equipment = await ensureAttribute(prisma, trucks.id, {
    key: "equipment",
    name: "Комплектація",
    type: "MULTI_SELECT",
    isFacet: false,
    sortOrder: 10,
  });

  const euro = await prisma.attributeDefinition.findUniqueOrThrow({
    where: { taxonomyNodeId_key: { taxonomyNodeId: trucks.id, key: "euro" } },
  });
  const transmission = await prisma.attributeDefinition.findUniqueOrThrow({
    where: {
      taxonomyNodeId_key: { taxonomyNodeId: trucks.id, key: "transmission" },
    },
  });
  const axle = await prisma.attributeDefinition.findUniqueOrThrow({
    where: { taxonomyNodeId_key: { taxonomyNodeId: trucks.id, key: "axle" } },
  });

  await ensureSelectOptions(prisma, make.id, [
    { label: "Scania", slug: "scania", sortOrder: 0 },
    { label: "Volvo", slug: "volvo", sortOrder: 1 },
    { label: "DAF", slug: "daf", sortOrder: 2 },
    { label: "Mercedes-Benz", slug: "mercedes-benz", sortOrder: 3 },
    { label: "MAN", slug: "man", sortOrder: 4 },
  ]);

  const makeOptions = await prisma.attributeOption.findMany({
    where: { attributeId: make.id },
  });
  const bySlug = Object.fromEntries(makeOptions.map((o) => [o.slug, o.id]));

  await ensureSelectOptions(prisma, model.id, [
    { label: "R450", slug: "r450", parentOptionId: bySlug.scania, sortOrder: 0 },
    { label: "R500", slug: "r500", parentOptionId: bySlug.scania, sortOrder: 1 },
    { label: "FH16", slug: "fh16", parentOptionId: bySlug.volvo, sortOrder: 0 },
    { label: "FH460", slug: "fh460", parentOptionId: bySlug.volvo, sortOrder: 1 },
    { label: "XF", slug: "xf", parentOptionId: bySlug.daf, sortOrder: 0 },
    {
      label: "Actros 1845",
      slug: "actros-1845",
      parentOptionId: bySlug["mercedes-benz"],
      sortOrder: 0,
    },
    {
      label: "Actros 2545",
      slug: "actros-2545",
      parentOptionId: bySlug["mercedes-benz"],
      sortOrder: 1,
    },
    { label: "TGX", slug: "tgx", parentOptionId: bySlug.man, sortOrder: 0 },
  ]);

  await ensureSelectOptions(prisma, euro.id, [
    { label: "Euro 3", slug: "euro-3", sortOrder: 0 },
    { label: "Euro 4", slug: "euro-4", sortOrder: 1 },
    { label: "Euro 5", slug: "euro-5", sortOrder: 2 },
    { label: "Euro 6", slug: "euro-6", sortOrder: 3 },
  ]);
  await ensureSelectOptions(prisma, transmission.id, [
    { label: "МКПП", slug: "manual", sortOrder: 0 },
    { label: "АКПП", slug: "automatic", sortOrder: 1 },
  ]);
  await ensureSelectOptions(prisma, axle.id, [
    { label: "4×2", slug: "4x2", sortOrder: 0 },
    { label: "6×2", slug: "6x2", sortOrder: 1 },
    { label: "6×4", slug: "6x4", sortOrder: 2 },
  ]);

  // AutoRIA-style truck equipment checklist (flat MULTI_SELECT).
  await ensureSelectOptions(prisma, equipment.id, [
    { label: "ABS", slug: "abs", sortOrder: 0 },
    { label: "ASR / ESP", slug: "asr-esp", sortOrder: 1 },
    { label: "Кондиціонер", slug: "air-conditioning", sortOrder: 2 },
    { label: "Клімат-контроль", slug: "climate-control", sortOrder: 3 },
    { label: "Автономний обігрівач", slug: "parking-heater", sortOrder: 4 },
    { label: "Тахограф", slug: "tachograph", sortOrder: 5 },
    { label: "Круїз-контроль", slug: "cruise-control", sortOrder: 6 },
    { label: "Електросклопідйомники", slug: "power-windows", sortOrder: 7 },
    { label: "Центральний замок", slug: "central-locking", sortOrder: 8 },
    { label: "Підігрів дзеркал", slug: "heated-mirrors", sortOrder: 9 },
    { label: "Підігрів сидінь", slug: "heated-seats", sortOrder: 10 },
    { label: "Пневмопідвіска", slug: "air-suspension", sortOrder: 11 },
    { label: "Ретардер / інтардер", slug: "retarder", sortOrder: 12 },
    { label: "Блокування диференціала", slug: "diff-lock", sortOrder: 13 },
    { label: "Гідроборт", slug: "tail-lift", sortOrder: 14 },
    { label: "Додатковий паливний бак", slug: "extra-fuel-tank", sortOrder: 15 },
    { label: "Спальник", slug: "sleeper-cab", sortOrder: 16 },
    { label: "GPS-навігація", slug: "gps", sortOrder: 17 },
    { label: "Камера заднього виду", slug: "rear-camera", sortOrder: 18 },
    { label: "Парктронік", slug: "parking-sensors", sortOrder: 19 },
    { label: "Мультимедіа / Bluetooth", slug: "multimedia", sortOrder: 20 },
    { label: "LED-оптика", slug: "led-lights", sortOrder: 21 },
    { label: "Холодильник", slug: "fridge", sortOrder: 22 },
    { label: "AdBlue", slug: "adblue", sortOrder: 23 },
    { label: "Фільтр сажі (DPF)", slug: "dpf", sortOrder: 24 },
  ]);

  // Leaf-only fields (container_size, twist_locks, …) are managed in CMS —
  // do not auto-recreate them here after the admin deletes them.

  console.log("Ensured vantazhni-avto catalog fields and options.");
}
