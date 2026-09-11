import type { PrismaClient } from "@prisma/client";

const TRUCKS_SLUG = "vantazhni-avto";
const CONTAINER_SLUG = "kontejnerovozy";

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
    type: "SELECT" | "NUMBER" | "TEXT" | "BOOLEAN" | "YEAR";
    unit?: string | null;
    dependsOnAttributeId?: string | null;
    isIdentity?: boolean;
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
      isIdentity: data.isIdentity ?? false,
      isFacet: data.isFacet ?? true,
      isRequired: data.isRequired ?? false,
      sortOrder: data.sortOrder,
    },
    update: {
      name: data.name,
      type: data.type,
      unit: data.unit ?? null,
      dependsOnAttributeId: data.dependsOnAttributeId ?? null,
      isIdentity: data.isIdentity ?? false,
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
    isIdentity: true,
    isFacet: true,
    isRequired: true,
    sortOrder: 0,
  });
  const model = await ensureAttribute(prisma, trucks.id, {
    key: "model",
    name: "Модель",
    type: "SELECT",
    dependsOnAttributeId: make.id,
    isIdentity: true,
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

  const containers = await prisma.taxonomyNode.findUnique({
    where: { slug: CONTAINER_SLUG },
  });
  if (containers) {
    await ensureAttribute(prisma, containers.id, {
      key: "container_size",
      name: "Тип контейнера",
      type: "SELECT",
      isFacet: true,
      isRequired: true,
      sortOrder: 0,
    });
    await ensureAttribute(prisma, containers.id, {
      key: "twist_locks",
      name: "Твістлоки",
      type: "BOOLEAN",
      isFacet: true,
      sortOrder: 1,
    });
    const containerSize = await prisma.attributeDefinition.findUniqueOrThrow({
      where: {
        taxonomyNodeId_key: {
          taxonomyNodeId: containers.id,
          key: "container_size",
        },
      },
    });
    await ensureSelectOptions(prisma, containerSize.id, [
      { label: "20′", slug: "20ft", sortOrder: 0 },
      { label: "40′", slug: "40ft", sortOrder: 1 },
      { label: "45′", slug: "45ft", sortOrder: 2 },
      { label: "2×20′", slug: "2x20ft", sortOrder: 3 },
    ]);
  }

  console.log("Ensured truck/container catalog fields and options.");
}
