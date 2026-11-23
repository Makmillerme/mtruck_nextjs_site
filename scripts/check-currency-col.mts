import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
try {
  const cols = await prisma.$queryRaw`
    SELECT column_name, data_type, udt_name, column_default
    FROM information_schema.columns
    WHERE table_name = 'Product' AND column_name = 'currency'
  `;
  console.log("cols", cols);
  const fks = await prisma.$queryRaw`
    SELECT conname, pg_get_constraintdef(oid) AS def
    FROM pg_constraint
    WHERE conrelid = '"Product"'::regclass AND contype = 'f'
  `;
  console.log("fks", fks);
} finally {
  await prisma.$disconnect();
}
