import { PrismaClient } from "@prisma/client";

const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!url) {
  throw new Error("DIRECT_URL / DATABASE_URL missing");
}

const prisma = new PrismaClient({
  datasources: { db: { url } },
});

try {
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Product" ALTER COLUMN currency DROP DEFAULT;
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Product"
    ALTER COLUMN currency TYPE TEXT
    USING currency::text;
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Product" ALTER COLUMN currency SET DEFAULT 'USD';
  `);
  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      ALTER TABLE "Product"
      ADD CONSTRAINT "Product_currency_fkey"
      FOREIGN KEY (currency) REFERENCES "Currency"(code)
      ON UPDATE CASCADE ON DELETE RESTRICT;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `);

  const cols = await prisma.$queryRaw`
    SELECT column_name, data_type, udt_name, column_default
    FROM information_schema.columns
    WHERE table_name = 'Product' AND column_name = 'currency'
  `;
  console.log("migrated", cols);
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
