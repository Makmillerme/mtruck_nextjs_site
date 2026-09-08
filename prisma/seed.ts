import { PrismaClient } from "@prisma/client";
import { getAdminBootstrap } from "../lib/admin";
import { auth } from "../lib/auth";
import products from "./products.json";

const prisma = new PrismaClient();

async function ensureUser(
  name: string,
  email: string,
  password: string,
  image?: string
) {
  const existing = await prisma.user.findUnique({
    where: { email },
    include: { accounts: true },
  });
  const hasPassword = existing?.accounts.some(
    (account) => account.providerId === "credential" && account.password
  );
  if (existing && hasPassword) {
    if (image && !existing.image) {
      return prisma.user.update({
        where: { id: existing.id },
        data: { image },
      });
    }
    return existing;
  }
  if (existing) {
    await prisma.user.delete({ where: { id: existing.id } });
  }

  await auth.api.signUpEmail({
    body: { name, email, password, image },
  });

  const created = await prisma.user.findUniqueOrThrow({ where: { email } });
  if (image && created.image !== image) {
    return prisma.user.update({
      where: { id: created.id },
      data: { image },
    });
  }
  return created;
}

async function main() {
  const adminBootstrap = getAdminBootstrap();
  const admin = await ensureUser(
    adminBootstrap.name,
    adminBootstrap.email,
    adminBootstrap.password,
    adminBootstrap.image
  );
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
