import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const products = await p.product.findMany({
  include: {
    images: true,
    specs: { include: { attribute: true, option: true } },
    taxonomyNode: true,
  },
  orderBy: { createdAt: "desc" },
});
console.log(JSON.stringify(products.map(pr => ({
  name: pr.name,
  company: pr.company,
  folder: pr.taxonomyNode?.name,
  images: pr.images.length,
  specs: pr.specs.map(s => [s.attribute.key, s.option?.label ?? s.numberValue ?? s.textValue ?? s.booleanValue]),
})), null, 2));
await p.$disconnect();
