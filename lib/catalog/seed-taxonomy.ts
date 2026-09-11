import type { PrismaClient } from "@prisma/client";

export async function seedCatalogTaxonomyIfEmpty(prisma: PrismaClient) {
  const count = await prisma.taxonomyNode.count();
  if (count > 0) {
    console.log(`Skipping taxonomy seed; ${count} folders already exist.`);
    return;
  }

  const cluster = await prisma.taxonomyNode.create({
    data: {
      name: "Комерційна техніка",
      slug: "komercijna-tehnika",
      sortOrder: 0,
    },
  });
  const trucks = await prisma.taxonomyNode.create({
    data: {
      name: "Вантажні авто",
      slug: "vantazhni-avto",
      parentId: cluster.id,
      sortOrder: 0,
    },
  });
  await prisma.taxonomyNode.create({
    data: {
      name: "Контейнеровози",
      slug: "kontejnerovozy",
      parentId: trucks.id,
      sortOrder: 0,
    },
  });
  await prisma.taxonomyNode.create({
    data: {
      name: "Причепи",
      slug: "prychepy",
      parentId: cluster.id,
      sortOrder: 1,
    },
  });

  const make = await prisma.attributeDefinition.create({
    data: {
      taxonomyNodeId: trucks.id,
      key: "make",
      name: "Марка",
      type: "SELECT",
      isIdentity: true,
      isFacet: true,
      isRequired: true,
      sortOrder: 0,
    },
  });
  const model = await prisma.attributeDefinition.create({
    data: {
      taxonomyNodeId: trucks.id,
      key: "model",
      name: "Модель",
      type: "SELECT",
      dependsOnAttributeId: make.id,
      isIdentity: true,
      isFacet: true,
      isRequired: true,
      sortOrder: 1,
    },
  });
  await prisma.attributeDefinition.createMany({
    data: [
      {
        taxonomyNodeId: trucks.id,
        key: "year",
        name: "Рік",
        type: "YEAR",
        isFacet: true,
        isRequired: true,
        sortOrder: 2,
      },
      {
        taxonomyNodeId: trucks.id,
        key: "mileage",
        name: "Пробіг",
        type: "NUMBER",
        unit: "км",
        isFacet: true,
        sortOrder: 3,
      },
      {
        taxonomyNodeId: trucks.id,
        key: "power_hp",
        name: "Потужність",
        type: "NUMBER",
        unit: "к.с.",
        isFacet: true,
        sortOrder: 4,
      },
    ],
  });

  const scania = await prisma.attributeOption.create({
    data: {
      attributeId: make.id,
      label: "Scania",
      slug: "scania",
      sortOrder: 0,
    },
  });
  const volvo = await prisma.attributeOption.create({
    data: {
      attributeId: make.id,
      label: "Volvo",
      slug: "volvo",
      sortOrder: 1,
    },
  });
  const daf = await prisma.attributeOption.create({
    data: {
      attributeId: make.id,
      label: "DAF",
      slug: "daf",
      sortOrder: 2,
    },
  });

  await prisma.attributeOption.createMany({
    data: [
      {
        attributeId: model.id,
        parentOptionId: scania.id,
        label: "R450",
        slug: "r450",
        sortOrder: 0,
      },
      {
        attributeId: model.id,
        parentOptionId: scania.id,
        label: "R500",
        slug: "r500",
        sortOrder: 1,
      },
      {
        attributeId: model.id,
        parentOptionId: volvo.id,
        label: "FH16",
        slug: "fh16",
        sortOrder: 0,
      },
      {
        attributeId: model.id,
        parentOptionId: daf.id,
        label: "XF",
        slug: "xf",
        sortOrder: 0,
      },
    ],
  });

  console.log("Seeded catalog taxonomy (commercial / trucks / container). Furniture products were not removed.");
}
