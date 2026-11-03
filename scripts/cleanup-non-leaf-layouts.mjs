import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const nodes = await db.taxonomyNode.findMany({
  select: { id: true, parentId: true },
});
const parentIds = new Set(
  nodes.map((n) => n.parentId).filter(Boolean)
);
const nonLeafIds = nodes.filter((n) => parentIds.has(n.id)).map((n) => n.id);

console.log("nonLeaf count", nonLeafIds.length);

const card = await db.cardPreviewLayout.deleteMany({
  where: { taxonomyNodeId: { in: nonLeafIds } },
});
const page = await db.productPageLayout.deleteMany({
  where: { taxonomyNodeId: { in: nonLeafIds } },
});

console.log("deleted cardPreview", card.count, "productPage", page.count);
await db.$disconnect();
