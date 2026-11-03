import { PrismaClient } from "@prisma/client";
import { ensureTruckCatalogFields } from "../lib/catalog/ensure-truck-fields";

const prisma = new PrismaClient();

async function main() {
  await ensureTruckCatalogFields(prisma);
  const eq = await prisma.attributeDefinition.findFirst({
    where: { key: "equipment" },
    include: {
      options: { orderBy: { sortOrder: "asc" } },
      taxonomyNode: { select: { slug: true, name: true } },
    },
  });
  console.log(
    JSON.stringify(
      {
        folder: eq?.taxonomyNode,
        name: eq?.name,
        type: eq?.type,
        optionCount: eq?.options.length,
        options: eq?.options.map((o) => o.label),
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
