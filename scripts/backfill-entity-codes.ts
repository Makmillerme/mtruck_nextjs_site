import { backfillEntityCodes } from "../lib/codes";

async function main() {
  const result = await backfillEntityCodes();
  console.log(
    `Backfilled userCode for ${result.users} users, productCode for ${result.products} products.`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    const { default: db } = await import("../utils/db");
    await db.$disconnect();
  });
