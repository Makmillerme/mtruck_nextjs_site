import type { PrismaClient } from "@prisma/client";
import { seedDefaultCardPreviewLayouts } from "@/lib/catalog/card-preview";

export async function ensureCardPreviewLayouts(prisma: PrismaClient) {
  const created = await seedDefaultCardPreviewLayouts(prisma);
  if (created > 0) {
    console.log(`Seeded ${created} default card preview layouts.`);
  }
}
