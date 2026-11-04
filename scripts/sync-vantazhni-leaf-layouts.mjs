/**
 * Sync ProductPage + CardPreview layouts for Вантажні авто leaves
 * (Контейнеровози, Тягачі, Фургони) to one leaf-only canon:
 *   key facts + tabs Опис → Характеристики → Комплектація
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const LEAF_SLUGS = ["kontejnerovozy", "tiahachi", "furhony"];
const KEY_FACT_KEYS = [
  "mileage",
  "power_hp",
  "euro",
  "transmission",
  "axle",
  "location",
];
const TABLE_KEYS = [
  "make",
  "model",
  "year",
  "mileage",
  "power_hp",
  "euro",
  "transmission",
  "axle",
  "location",
  "feature",
];
const CARD_SLOT_KEYS = [
  "mileage",
  "power_hp",
  "transmission",
  "euro",
  "axle",
  "location",
];

async function main() {
  const parent = await db.taxonomyNode.findFirst({
    where: { slug: "vantazhni-avto" },
    select: { id: true },
  });
  if (!parent) throw new Error("vantazhni-avto not found");

  const attrs = await db.attributeDefinition.findMany({
    where: { taxonomyNodeId: parent.id },
    select: { id: true, key: true },
  });
  const byKey = new Map(attrs.map((a) => [a.key, a.id]));
  const requireId = (key) => {
    const id = byKey.get(key);
    if (!id) throw new Error(`missing attribute ${key}`);
    return id;
  };

  const leaves = await db.taxonomyNode.findMany({
    where: { slug: { in: LEAF_SLUGS }, parentId: parent.id },
    select: { id: true, name: true, slug: true },
  });
  if (leaves.length !== LEAF_SLUGS.length) {
    throw new Error(
      `expected ${LEAF_SLUGS.length} leaves, got ${leaves.map((l) => l.slug)}`
    );
  }

  for (const leaf of leaves) {
    const layout = await db.productPageLayout.upsert({
      where: { taxonomyNodeId: leaf.id },
      create: { taxonomyNodeId: leaf.id, keyFactsMax: 6 },
      update: { keyFactsMax: 6 },
    });

    await db.productPageKeyFactSlot.deleteMany({ where: { layoutId: layout.id } });
    await db.productPageKeyFactSlot.createMany({
      data: KEY_FACT_KEYS.map((key, sortOrder) => ({
        layoutId: layout.id,
        attributeId: requireId(key),
        visible: true,
        sortOrder,
      })),
    });

    await db.productPageTab.deleteMany({ where: { layoutId: layout.id } });

    const opis = await db.productPageTab.create({
      data: {
        layoutId: layout.id,
        name: "Опис",
        kind: "TEXT",
        sortOrder: 0,
      },
    });
    await db.productPageTabSlot.create({
      data: {
        tabId: opis.id,
        attributeId: null,
        systemSource: "DESCRIPTION",
        visible: true,
        sortOrder: 0,
      },
    });

    const chars = await db.productPageTab.create({
      data: {
        layoutId: layout.id,
        name: "Характеристики",
        kind: "TABLE",
        sortOrder: 1,
      },
    });
    await db.productPageTabSlot.createMany({
      data: TABLE_KEYS.map((key, sortOrder) => ({
        tabId: chars.id,
        attributeId: requireId(key),
        systemSource: null,
        visible: true,
        sortOrder,
      })),
    });

    const equip = await db.productPageTab.create({
      data: {
        layoutId: layout.id,
        name: "Комплектація",
        kind: "LIST",
        sortOrder: 2,
      },
    });
    await db.productPageTabSlot.create({
      data: {
        tabId: equip.id,
        attributeId: requireId("equipment"),
        systemSource: null,
        visible: true,
        sortOrder: 0,
      },
    });

    // Legacy SpecSlots = first TABLE (save parity)
    await db.productPageSpecSlot.deleteMany({ where: { layoutId: layout.id } });
    await db.productPageSpecSlot.createMany({
      data: TABLE_KEYS.map((key, sortOrder) => ({
        layoutId: layout.id,
        attributeId: requireId(key),
        visible: true,
        sortOrder,
      })),
    });

    const card = await db.cardPreviewLayout.upsert({
      where: { taxonomyNodeId: leaf.id },
      create: {
        taxonomyNodeId: leaf.id,
        showName: true,
        showPrice: true,
        showStatus: true,
        showSubtitle: true,
        showSpecs: true,
        specsStyle: "TAGS",
        specsGridCount: 6,
        categorySource: "PRODUCT_FOLDER",
      },
      update: {
        showName: true,
        showPrice: true,
        showStatus: true,
        showSubtitle: true,
        showSpecs: true,
        specsStyle: "TAGS",
        specsGridCount: 6,
        categorySource: "PRODUCT_FOLDER",
      },
    });

    await db.cardPreviewSlot.deleteMany({ where: { layoutId: card.id } });
    await db.cardPreviewSlot.createMany({
      data: CARD_SLOT_KEYS.map((key, sortOrder) => ({
        layoutId: card.id,
        attributeId: requireId(key),
        sortOrder,
      })),
    });

    await db.cardPreviewSubtitleSlot.deleteMany({ where: { layoutId: card.id } });
    await db.cardPreviewSubtitleSlot.create({
      data: {
        layoutId: card.id,
        attributeId: requireId("year"),
        sortOrder: 0,
      },
    });

    console.log("synced", leaf.slug, leaf.name);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
