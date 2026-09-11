import { PrismaClient } from "@prisma/client";
import { wipeAndSeedDemoVehicles } from "../lib/catalog/seed-demo-vehicles";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    select: { id: true, email: true },
  });
  if (!admin) {
    throw new Error("No ADMIN user found. Run npm run db:seed first.");
  }
  console.log(`Using admin ${admin.email}`);
  await wipeAndSeedDemoVehicles(prisma, admin.id);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
