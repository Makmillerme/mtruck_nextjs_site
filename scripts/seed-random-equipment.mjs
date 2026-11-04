/** Randomly fill MULTI_SELECT «Комплектація» on every active product. */
import { PrismaClient } from "@prisma/client";
import { randomInt } from "node:crypto";

const db = new PrismaClient();

function pickRandom(ids, minCount, maxCount) {
  const copy = [...ids];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  const hi = Math.min(maxCount, copy.length);
  const lo = Math.min(minCount, hi);
  const count = lo === hi ? lo : randomInt(lo, hi + 1);
  return copy.slice(0, count);
}

async function main() {
  const equipment = await db.attributeDefinition.findFirst({
    where: { key: "equipment" },
    include: {
      options: { select: { id: true }, orderBy: { sortOrder: "asc" } },
    },
  });
  if (!equipment) throw new Error("equipment attribute missing");
  const optionIds = equipment.options.map((row) => row.id);
  if (optionIds.length === 0) throw new Error("equipment has no options");

  const products = await db.product.findMany({
    where: { archivedAt: null },
    select: { id: true, name: true },
  });

  let updated = 0;
  for (const product of products) {
    const chosen = pickRandom(optionIds, 5, 12);
    const spec = await db.productSpec.upsert({
      where: {
        productId_attributeId: {
          productId: product.id,
          attributeId: equipment.id,
        },
      },
      create: {
        productId: product.id,
        attributeId: equipment.id,
      },
      update: {},
      select: { id: true },
    });

    await db.productSpecOption.deleteMany({ where: { productSpecId: spec.id } });
    if (chosen.length > 0) {
      await db.productSpecOption.createMany({
        data: chosen.map((optionId) => ({
          productSpecId: spec.id,
          optionId,
        })),
      });
    }
    updated += 1;
  }

  console.log(
    JSON.stringify({
      products: products.length,
      updated,
      optionPool: optionIds.length,
      perProduct: "5–12 random",
    })
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
