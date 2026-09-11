import type { PrismaClient } from "@prisma/client";
import { ensureTruckCatalogFields } from "./ensure-truck-fields";

const CONTAINER_SLUG = "kontejnerovozy";

const DEMO_GALLERY = [
  "https://images.pexels.com/photos/2199293/pexels-photo-2199293.jpeg?auto=compress&cs=tinysrgb&w=1600",
  "https://images.pexels.com/photos/1118448/pexels-photo-1118448.jpeg?auto=compress&cs=tinysrgb&w=1600",
  "https://images.pexels.com/photos/1427541/pexels-photo-1427541.jpeg?auto=compress&cs=tinysrgb&w=1600",
  "https://images.pexels.com/photos/93398/pexels-photo-93398.jpeg?auto=compress&cs=tinysrgb&w=1600",
  "https://images.pexels.com/photos/6169668/pexels-photo-6169668.jpeg?auto=compress&cs=tinysrgb&w=1600",
];

type DemoVehicle = {
  name: string;
  company: string;
  price: number;
  description: string;
  featured: boolean;
  makeSlug: string;
  modelSlug: string;
  year: number;
  mileage: number;
  powerHp: number;
  euroSlug: string;
  transmissionSlug: string;
  axleSlug: string;
  location: string;
  feature: string;
  containerSizeSlug: string;
  twistLocks: boolean;
  imageIndexes: number[];
};

const DEMO_VEHICLES: DemoVehicle[] = [
  {
    name: "Scania R450 контейнеровоз",
    company: "Scania",
    price: 68500,
    description:
      "Контейнеровоз Scania R450 у робочому стані. Підходить під 40′ контейнер, обслуговування за регламентом, готовність до роботи з портами та логістичними хабами України.",
    featured: true,
    makeSlug: "scania",
    modelSlug: "r450",
    year: 2019,
    mileage: 612000,
    powerHp: 450,
    euroSlug: "euro-6",
    transmissionSlug: "automatic",
    axleSlug: "6x2",
    location: "Львів",
    feature: "Сервісна історія",
    containerSizeSlug: "40ft",
    twistLocks: true,
    imageIndexes: [0, 1, 2],
  },
  {
    name: "Volvo FH460 контейнеровоз",
    company: "Volvo",
    price: 72900,
    description:
      "Volvo FH460 для контейнерних перевезень. АКПП, Euro 6, комфортна кабіна. Техніка перевірена, документи в порядку.",
    featured: true,
    makeSlug: "volvo",
    modelSlug: "fh460",
    year: 2020,
    mileage: 498000,
    powerHp: 460,
    euroSlug: "euro-6",
    transmissionSlug: "automatic",
    axleSlug: "4x2",
    location: "Київ",
    feature: "Перевірено МTruck",
    containerSizeSlug: "45ft",
    twistLocks: true,
    imageIndexes: [1, 3, 4],
  },
  {
    name: "Mercedes-Benz Actros 1845",
    company: "Mercedes-Benz",
    price: 65500,
    description:
      "Actros 1845 під 40′ контейнер. Надійна платформа для регулярних рейсів Європа — Україна. Твістлоки в комплекті.",
    featured: false,
    makeSlug: "mercedes-benz",
    modelSlug: "actros-1845",
    year: 2018,
    mileage: 744000,
    powerHp: 450,
    euroSlug: "euro-6",
    transmissionSlug: "automatic",
    axleSlug: "4x2",
    location: "Одеса",
    feature: "Готовий до рейсу",
    containerSizeSlug: "40ft",
    twistLocks: true,
    imageIndexes: [2, 0, 4],
  },
  {
    name: "DAF XF контейнеровоз",
    company: "DAF",
    price: 58900,
    description:
      "DAF XF для 2×20′ або 40′. Економічний варіант для флоту. Пробіг реальний, технічний стан відповідає року.",
    featured: false,
    makeSlug: "daf",
    modelSlug: "xf",
    year: 2017,
    mileage: 821000,
    powerHp: 460,
    euroSlug: "euro-5",
    transmissionSlug: "manual",
    axleSlug: "6x2",
    location: "Харків",
    feature: "Ціна / стан",
    containerSizeSlug: "2x20ft",
    twistLocks: true,
    imageIndexes: [3, 1, 2],
  },
];

async function optionId(
  prisma: PrismaClient,
  attributeId: string,
  slug: string
) {
  const option = await prisma.attributeOption.findUnique({
    where: { attributeId_slug: { attributeId, slug } },
  });
  if (!option) throw new Error(`Missing option ${slug} for ${attributeId}`);
  return option.id;
}

async function attrId(
  prisma: PrismaClient,
  taxonomyNodeId: string,
  key: string
) {
  const attr = await prisma.attributeDefinition.findUnique({
    where: { taxonomyNodeId_key: { taxonomyNodeId, key } },
  });
  if (!attr) throw new Error(`Missing attribute ${key}`);
  return attr;
}

/** Видаляє всі товари (меблі тощо) і сідить 4 демо-контейнеровози. */
export async function wipeAndSeedDemoVehicles(
  prisma: PrismaClient,
  adminUserId: string
) {
  await ensureTruckCatalogFields(prisma);

  const deleted = await prisma.product.deleteMany({});
  console.log(`Deleted ${deleted.count} existing products.`);

  const containers = await prisma.taxonomyNode.findUnique({
    where: { slug: CONTAINER_SLUG },
  });
  if (!containers) {
    throw new Error("Folder kontejnerovozy not found");
  }

  const trucks = await prisma.taxonomyNode.findUniqueOrThrow({
    where: { slug: "vantazhni-avto" },
  });

  const make = await attrId(prisma, trucks.id, "make");
  const model = await attrId(prisma, trucks.id, "model");
  const year = await attrId(prisma, trucks.id, "year");
  const mileage = await attrId(prisma, trucks.id, "mileage");
  const power = await attrId(prisma, trucks.id, "power_hp");
  const euro = await attrId(prisma, trucks.id, "euro");
  const transmission = await attrId(prisma, trucks.id, "transmission");
  const axle = await attrId(prisma, trucks.id, "axle");
  const location = await attrId(prisma, trucks.id, "location");
  const feature = await attrId(prisma, trucks.id, "feature");
  const containerSize = await attrId(prisma, containers.id, "container_size");
  const twistLocks = await attrId(prisma, containers.id, "twist_locks");

  for (const demo of DEMO_VEHICLES) {
    const gallery = demo.imageIndexes.map((i) => DEMO_GALLERY[i]!);
    const cover = gallery[0]!;

    await prisma.product.create({
      data: {
        name: demo.name,
        company: demo.company,
        description: demo.description,
        featured: demo.featured,
        image: cover,
        price: demo.price,
        userId: adminUserId,
        taxonomyNodeId: containers.id,
        status: "PUBLISHED",
        availability: "IN_STOCK",
        images: {
          create: gallery.map((url, sortOrder) => ({ url, sortOrder })),
        },
        specs: {
          create: [
            {
              attributeId: make.id,
              optionId: await optionId(prisma, make.id, demo.makeSlug),
            },
            {
              attributeId: model.id,
              optionId: await optionId(prisma, model.id, demo.modelSlug),
            },
            { attributeId: year.id, numberValue: demo.year },
            { attributeId: mileage.id, numberValue: demo.mileage },
            { attributeId: power.id, numberValue: demo.powerHp },
            {
              attributeId: euro.id,
              optionId: await optionId(prisma, euro.id, demo.euroSlug),
            },
            {
              attributeId: transmission.id,
              optionId: await optionId(
                prisma,
                transmission.id,
                demo.transmissionSlug
              ),
            },
            {
              attributeId: axle.id,
              optionId: await optionId(prisma, axle.id, demo.axleSlug),
            },
            { attributeId: location.id, textValue: demo.location },
            { attributeId: feature.id, textValue: demo.feature },
            {
              attributeId: containerSize.id,
              optionId: await optionId(
                prisma,
                containerSize.id,
                demo.containerSizeSlug
              ),
            },
            {
              attributeId: twistLocks.id,
              booleanValue: demo.twistLocks,
            },
          ],
        },
      },
    });
  }

  console.log(`Seeded ${DEMO_VEHICLES.length} demo container vehicles.`);
}
