import type { PrismaClient } from "@prisma/client";
import { ensureTruckCatalogFields } from "./ensure-truck-fields";

const CONTAINER_SLUG = "kontejnerovozy";
const TRACTOR_SLUG = "tiahachi";
const VAN_SLUG = "furhony";

const DEMO_GALLERY = [
  "https://images.pexels.com/photos/2199293/pexels-photo-2199293.jpeg?auto=compress&cs=tinysrgb&w=1600",
  "https://images.pexels.com/photos/1118448/pexels-photo-1118448.jpeg?auto=compress&cs=tinysrgb&w=1600",
  "https://images.pexels.com/photos/1427541/pexels-photo-1427541.jpeg?auto=compress&cs=tinysrgb&w=1600",
  "https://images.pexels.com/photos/93398/pexels-photo-93398.jpeg?auto=compress&cs=tinysrgb&w=1600",
  "https://images.pexels.com/photos/6169668/pexels-photo-6169668.jpeg?auto=compress&cs=tinysrgb&w=1600",
];

type FolderSlug = typeof CONTAINER_SLUG | typeof TRACTOR_SLUG | typeof VAN_SLUG;

type DemoVehicle = {
  folderSlug: FolderSlug;
  name: string;
  price: number;
  description: string;
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
  containerSizeSlug?: string;
  twistLocks?: boolean;
  imageIndexes: number[];
};

const DEMO_VEHICLES: DemoVehicle[] = [
  // —— Контейнеровози (10)
  {
    folderSlug: CONTAINER_SLUG,
    name: "Scania R450 контейнеровоз",
    price: 68500,
    description:
      "Контейнеровоз Scania R450 у робочому стані. Під 40′ контейнер, сервіс за регламентом, готовність до портів і хабів України.",
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
    folderSlug: CONTAINER_SLUG,
    name: "Volvo FH460 контейнеровоз",
    price: 72900,
    description:
      "Volvo FH460 для контейнерних перевезень. АКПП, Euro 6, комфортна кабіна. Техніка перевірена, документи в порядку.",
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
    folderSlug: CONTAINER_SLUG,
    name: "Mercedes-Benz Actros 1845 контейнеровоз",
    price: 65500,
    description:
      "Actros 1845 під 40′. Надійна платформа для рейсів Європа — Україна. Твістлоки в комплекті.",
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
    folderSlug: CONTAINER_SLUG,
    name: "DAF XF контейнеровоз",
    price: 58900,
    description:
      "DAF XF для 2×20′ або 40′. Економічний варіант для флоту. Пробіг реальний.",
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
  {
    folderSlug: CONTAINER_SLUG,
    name: "MAN TGX контейнеровоз",
    price: 61200,
    description:
      "MAN TGX під 40′. Збалансований варіант для регулярних контейнерних рейсів.",
    makeSlug: "man",
    modelSlug: "tgx",
    year: 2018,
    mileage: 690000,
    powerHp: 440,
    euroSlug: "euro-6",
    transmissionSlug: "automatic",
    axleSlug: "6x2",
    location: "Дніпро",
    feature: "АКПП",
    containerSizeSlug: "40ft",
    twistLocks: true,
    imageIndexes: [4, 0, 1],
  },
  {
    folderSlug: CONTAINER_SLUG,
    name: "Scania R500 контейнеровоз",
    price: 79800,
    description:
      "Потужний Scania R500 під 45′. Підходить для важких маршрутів і портів.",
    makeSlug: "scania",
    modelSlug: "r500",
    year: 2021,
    mileage: 365000,
    powerHp: 500,
    euroSlug: "euro-6",
    transmissionSlug: "automatic",
    axleSlug: "6x2",
    location: "Київ",
    feature: "Низький пробіг",
    containerSizeSlug: "45ft",
    twistLocks: true,
    imageIndexes: [0, 2, 3],
  },
  {
    folderSlug: CONTAINER_SLUG,
    name: "Volvo FH16 контейнеровоз",
    price: 84500,
    description:
      "FH16 для важких контейнерів. Максимальна тяга, кабіна long-haul.",
    makeSlug: "volvo",
    modelSlug: "fh16",
    year: 2019,
    mileage: 540000,
    powerHp: 550,
    euroSlug: "euro-6",
    transmissionSlug: "automatic",
    axleSlug: "6x4",
    location: "Одеса",
    feature: "6×4",
    containerSizeSlug: "40ft",
    twistLocks: true,
    imageIndexes: [1, 4, 2],
  },
  {
    folderSlug: CONTAINER_SLUG,
    name: "Mercedes-Benz Actros 2545 контейнеровоз",
    price: 70200,
    description:
      "Actros 2545 під 40′ / 2×20′. Комфорт водія, стабільна економіка рейсу.",
    makeSlug: "mercedes-benz",
    modelSlug: "actros-2545",
    year: 2020,
    mileage: 455000,
    powerHp: 450,
    euroSlug: "euro-6",
    transmissionSlug: "automatic",
    axleSlug: "6x2",
    location: "Львів",
    feature: "Європа — Україна",
    containerSizeSlug: "2x20ft",
    twistLocks: true,
    imageIndexes: [2, 3, 0],
  },
  {
    folderSlug: CONTAINER_SLUG,
    name: "DAF XF 20′ контейнеровоз",
    price: 52400,
    description:
      "Компактний DAF під 20′. Зручно для міських і регіональних доставок.",
    makeSlug: "daf",
    modelSlug: "xf",
    year: 2016,
    mileage: 910000,
    powerHp: 410,
    euroSlug: "euro-5",
    transmissionSlug: "manual",
    axleSlug: "4x2",
    location: "Запоріжжя",
    feature: "Бюджетний вхід",
    containerSizeSlug: "20ft",
    twistLocks: false,
    imageIndexes: [3, 4, 1],
  },
  {
    folderSlug: CONTAINER_SLUG,
    name: "MAN TGX 45′ контейнеровоз",
    price: 66800,
    description:
      "MAN TGX під довгий 45′ контейнер. Перевірений варіант для портових плечей.",
    makeSlug: "man",
    modelSlug: "tgx",
    year: 2019,
    mileage: 580000,
    powerHp: 480,
    euroSlug: "euro-6",
    transmissionSlug: "automatic",
    axleSlug: "6x2",
    location: "Миколаїв",
    feature: "Портова логістика",
    containerSizeSlug: "45ft",
    twistLocks: true,
    imageIndexes: [4, 2, 0],
  },

  // —— Тягачі (8)
  {
    folderSlug: TRACTOR_SLUG,
    name: "Scania R450 тягач",
    price: 64200,
    description:
      "Сідловий тягач Scania R450. Підходить під напівпричепи різного типу.",
    makeSlug: "scania",
    modelSlug: "r450",
    year: 2018,
    mileage: 705000,
    powerHp: 450,
    euroSlug: "euro-6",
    transmissionSlug: "automatic",
    axleSlug: "4x2",
    location: "Київ",
    feature: "Сідло підготовлене",
    imageIndexes: [0, 3, 1],
  },
  {
    folderSlug: TRACTOR_SLUG,
    name: "Volvo FH460 тягач",
    price: 71500,
    description:
      "Volvo FH460 для магістральних перевезень. АКПП, економічний рейс.",
    makeSlug: "volvo",
    modelSlug: "fh460",
    year: 2020,
    mileage: 420000,
    powerHp: 460,
    euroSlug: "euro-6",
    transmissionSlug: "automatic",
    axleSlug: "4x2",
    location: "Львів",
    feature: "Long-haul",
    imageIndexes: [1, 0, 4],
  },
  {
    folderSlug: TRACTOR_SLUG,
    name: "Mercedes-Benz Actros 1845 тягач",
    price: 62800,
    description:
      "Actros 1845 сідловий. Стабільна техніка для щоденних рейсів.",
    makeSlug: "mercedes-benz",
    modelSlug: "actros-1845",
    year: 2017,
    mileage: 780000,
    powerHp: 450,
    euroSlug: "euro-6",
    transmissionSlug: "automatic",
    axleSlug: "4x2",
    location: "Одеса",
    feature: "Документи ок",
    imageIndexes: [2, 1, 3],
  },
  {
    folderSlug: TRACTOR_SLUG,
    name: "DAF XF тягач",
    price: 55600,
    description:
      "DAF XF для флоту. Простий в обслуговуванні, адекватна ціна.",
    makeSlug: "daf",
    modelSlug: "xf",
    year: 2016,
    mileage: 860000,
    powerHp: 460,
    euroSlug: "euro-5",
    transmissionSlug: "manual",
    axleSlug: "4x2",
    location: "Харків",
    feature: "Флотний варіант",
    imageIndexes: [3, 2, 4],
  },
  {
    folderSlug: TRACTOR_SLUG,
    name: "MAN TGX тягач",
    price: 60100,
    description:
      "MAN TGX сідловий Euro 6. Добре тримає економіку на довгих плечах.",
    makeSlug: "man",
    modelSlug: "tgx",
    year: 2019,
    mileage: 610000,
    powerHp: 440,
    euroSlug: "euro-6",
    transmissionSlug: "automatic",
    axleSlug: "4x2",
    location: "Дніпро",
    feature: "Euro 6",
    imageIndexes: [4, 1, 0],
  },
  {
    folderSlug: TRACTOR_SLUG,
    name: "Scania R500 тягач",
    price: 77200,
    description:
      "Потужний R500 для важких напівпричепів і гірських маршрутів.",
    makeSlug: "scania",
    modelSlug: "r500",
    year: 2021,
    mileage: 310000,
    powerHp: 500,
    euroSlug: "euro-6",
    transmissionSlug: "automatic",
    axleSlug: "6x2",
    location: "Київ",
    feature: "Запас потужності",
    imageIndexes: [0, 4, 2],
  },
  {
    folderSlug: TRACTOR_SLUG,
    name: "Volvo FH16 тягач",
    price: 88900,
    description:
      "FH16 6×4 для надважких складів. Максимальна тяга і ресурс.",
    makeSlug: "volvo",
    modelSlug: "fh16",
    year: 2018,
    mileage: 590000,
    powerHp: 550,
    euroSlug: "euro-6",
    transmissionSlug: "automatic",
    axleSlug: "6x4",
    location: "Одеса",
    feature: "Важкі вантажі",
    imageIndexes: [1, 2, 3],
  },
  {
    folderSlug: TRACTOR_SLUG,
    name: "Mercedes-Benz Actros 2545 тягач",
    price: 69400,
    description:
      "Actros 2545 сідловий. Комфорт кабіни і стабільний пробіг.",
    makeSlug: "mercedes-benz",
    modelSlug: "actros-2545",
    year: 2020,
    mileage: 470000,
    powerHp: 450,
    euroSlug: "euro-6",
    transmissionSlug: "automatic",
    axleSlug: "6x2",
    location: "Львів",
    feature: "Комфорт водія",
    imageIndexes: [2, 4, 1],
  },

  // —— Фургони (7)
  {
    folderSlug: VAN_SLUG,
    name: "Scania R450 фургон",
    price: 59800,
    description:
      "Бортовий / тентований варіант на базі Scania. Для палетної логістики.",
    makeSlug: "scania",
    modelSlug: "r450",
    year: 2017,
    mileage: 740000,
    powerHp: 450,
    euroSlug: "euro-6",
    transmissionSlug: "automatic",
    axleSlug: "6x2",
    location: "Київ",
    feature: "Палети",
    imageIndexes: [0, 1, 4],
  },
  {
    folderSlug: VAN_SLUG,
    name: "Volvo FH460 фургон",
    price: 67600,
    description:
      "Volvo з кузовом під генеральні вантажі. Зручний для рітейл-постачань.",
    makeSlug: "volvo",
    modelSlug: "fh460",
    year: 2019,
    mileage: 520000,
    powerHp: 460,
    euroSlug: "euro-6",
    transmissionSlug: "automatic",
    axleSlug: "6x2",
    location: "Львів",
    feature: "Рітейл",
    imageIndexes: [1, 3, 0],
  },
  {
    folderSlug: VAN_SLUG,
    name: "Mercedes-Benz Actros 1845 фургон",
    price: 58200,
    description:
      "Actros з кузовом. Надійний щоденний робочий інструмент.",
    makeSlug: "mercedes-benz",
    modelSlug: "actros-1845",
    year: 2016,
    mileage: 800000,
    powerHp: 450,
    euroSlug: "euro-5",
    transmissionSlug: "manual",
    axleSlug: "4x2",
    location: "Дніпро",
    feature: "Щоденна робота",
    imageIndexes: [2, 0, 3],
  },
  {
    folderSlug: VAN_SLUG,
    name: "DAF XF фургон",
    price: 51100,
    description:
      "DAF XF з кузовом. Бюджетний варіант для регіональних перевезень.",
    makeSlug: "daf",
    modelSlug: "xf",
    year: 2015,
    mileage: 950000,
    powerHp: 410,
    euroSlug: "euro-5",
    transmissionSlug: "manual",
    axleSlug: "4x2",
    location: "Харків",
    feature: "Регіон",
    imageIndexes: [3, 1, 4],
  },
  {
    folderSlug: VAN_SLUG,
    name: "MAN TGX фургон",
    price: 56400,
    description:
      "MAN TGX тентований. Добре підходить під збірні вантажі.",
    makeSlug: "man",
    modelSlug: "tgx",
    year: 2018,
    mileage: 650000,
    powerHp: 440,
    euroSlug: "euro-6",
    transmissionSlug: "automatic",
    axleSlug: "6x2",
    location: "Одеса",
    feature: "Збірні вантажі",
    imageIndexes: [4, 2, 1],
  },
  {
    folderSlug: VAN_SLUG,
    name: "Scania R500 фургон",
    price: 72100,
    description:
      "Потужний Scania з кузовом для важких палетних партій.",
    makeSlug: "scania",
    modelSlug: "r500",
    year: 2020,
    mileage: 390000,
    powerHp: 500,
    euroSlug: "euro-6",
    transmissionSlug: "automatic",
    axleSlug: "6x2",
    location: "Київ",
    feature: "Важкі партії",
    imageIndexes: [0, 3, 2],
  },
  {
    folderSlug: VAN_SLUG,
    name: "Mercedes-Benz Actros 2545 фургон",
    price: 64800,
    description:
      "Actros 2545 з кузовом. Комфорт і запас вантажопідйомності.",
    makeSlug: "mercedes-benz",
    modelSlug: "actros-2545",
    year: 2019,
    mileage: 505000,
    powerHp: 450,
    euroSlug: "euro-6",
    transmissionSlug: "automatic",
    axleSlug: "6x2",
    location: "Львів",
    feature: "Запас вантажу",
    imageIndexes: [2, 4, 0],
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

/** Видаляє всі товари і сідить демо-авто по гілках каталогу (без зміни схеми). */
export async function wipeAndSeedDemoVehicles(
  prisma: PrismaClient,
  adminUserId: string
) {
  await ensureTruckCatalogFields(prisma);

  const deleted = await prisma.product.deleteMany({});
  console.log(`Deleted ${deleted.count} existing products.`);

  const trucks = await prisma.taxonomyNode.findUniqueOrThrow({
    where: { slug: "vantazhni-avto" },
  });
  const containers = await prisma.taxonomyNode.findUniqueOrThrow({
    where: { slug: CONTAINER_SLUG },
  });
  const tractors = await prisma.taxonomyNode.findUniqueOrThrow({
    where: { slug: TRACTOR_SLUG },
  });
  const vans = await prisma.taxonomyNode.findUniqueOrThrow({
    where: { slug: VAN_SLUG },
  });

  const folderBySlug: Record<FolderSlug, string> = {
    [CONTAINER_SLUG]: containers.id,
    [TRACTOR_SLUG]: tractors.id,
    [VAN_SLUG]: vans.id,
  };

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

  const { generateUniqueProductCode } = await import("../codes");

  for (const demo of DEMO_VEHICLES) {
    const gallery = demo.imageIndexes.map((i) => DEMO_GALLERY[i]!);
    const cover = gallery[0]!;
    const productCode = await generateUniqueProductCode();

    const specs: {
      attributeId: string;
      optionId?: string;
      numberValue?: number;
      textValue?: string;
      booleanValue?: boolean;
    }[] = [
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
    ];

    if (demo.folderSlug === CONTAINER_SLUG) {
      if (!demo.containerSizeSlug) {
        throw new Error(`containerSizeSlug required for ${demo.name}`);
      }
      specs.push(
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
          booleanValue: demo.twistLocks ?? false,
        }
      );
    }

    await prisma.product.create({
      data: {
        name: demo.name,
        description: demo.description,
        image: cover,
        price: demo.price,
        productCode,
        userId: adminUserId,
        taxonomyNodeId: folderBySlug[demo.folderSlug],
        status: "PUBLISHED",
        availability: "IN_STOCK",
        images: {
          create: gallery.map((url, sortOrder) => ({ url, sortOrder })),
        },
        specs: { create: specs },
      },
    });
  }

  console.log(
    `Seeded ${DEMO_VEHICLES.length} demo vehicles (containers/tractors/vans).`
  );
}
