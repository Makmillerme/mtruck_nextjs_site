import { PrismaClient } from "@prisma/client";
import { auth } from "../lib/auth";
import products from "./products.json";

const prisma = new PrismaClient();

async function ensureUser(name: string, email: string, password: string) {
  const existing = await prisma.user.findUnique({
    where: { email },
    include: { accounts: true },
  });
  const hasPassword = existing?.accounts.some(
    (account) => account.providerId === "credential" && account.password
  );
  if (existing && hasPassword) return existing;
  if (existing) {
    await prisma.user.delete({ where: { id: existing.id } });
  }

  await auth.api.signUpEmail({
    body: { name, email, password },
  });

  return prisma.user.findUniqueOrThrow({ where: { email } });
}

async function main() {
  const admin = await ensureUser("Test Admin", "test@admin.com", "12345678");
  await ensureUser("Test User", "test@user.com", "12345678");

  const productCount = await prisma.product.count();
  if (productCount > 0) {
    console.log(`Skipping product seed; ${productCount} products already exist.`);
    return;
  }

  for (const product of products) {
    await prisma.product.create({
      data: {
        ...product,
        userId: admin.id,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
