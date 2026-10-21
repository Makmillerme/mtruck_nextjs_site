import { PrismaClient } from "@prisma/client";
import { ensureCardPreviewLayouts } from "../lib/catalog/seed-card-preview";

const prisma = new PrismaClient();

async function main() {
  await ensureCardPreviewLayouts(prisma);
  console.log("layouts", await prisma.cardPreviewLayout.count());
  console.log("slots", await prisma.cardPreviewSlot.count());
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
