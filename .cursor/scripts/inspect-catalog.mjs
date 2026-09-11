import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const products = await p.product.findMany({
  select: { id: true, name: true, company: true, image: true, taxonomyNodeId: true, status: true, price: true },
});
const nodes = await p.taxonomyNode.findMany({
  select: { id: true, name: true, slug: true, parentId: true },
  orderBy: { sortOrder: "asc" },
});
const attrs = await p.attributeDefinition.findMany({
  select: { id: true, key: true, name: true, type: true, taxonomyNodeId: true, isIdentity: true, unit: true },
  orderBy: { sortOrder: "asc" },
});
const opts = await p.attributeOption.findMany({
  select: { id: true, attributeId: true, label: true, slug: true, parentOptionId: true },
});
const admin = await p.user.findFirst({ where: { role: "ADMIN" }, select: { id: true, email: true } });
console.log(JSON.stringify({ productCount: products.length, products, nodes, attrs, opts, admin }, null, 2));
await p.$disconnect();
