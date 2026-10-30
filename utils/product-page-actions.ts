"use server";

import { fetchAttributesForNode } from "@/lib/catalog/taxonomy";
import db from "@/utils/db";
import { getAdminUser } from "@/utils/session";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const slotSchema = z.object({
  attributeId: z.string().uuid(),
  visible: z.boolean(),
});

const saveSchema = z.object({
  taxonomyNodeId: z.string().uuid(),
  slots: z.array(slotSchema).max(200),
});

export type SaveProductPageState = {
  message: string;
  ok?: boolean;
};

export async function saveProductPageLayoutAction(
  input: z.infer<typeof saveSchema>
): Promise<SaveProductPageState> {
  await getAdminUser();
  const t = await getTranslations("UiEditor");
  try {
    const data = saveSchema.parse(input);
    const node = await db.taxonomyNode.findUnique({
      where: { id: data.taxonomyNodeId },
      select: { id: true },
    });
    if (!node) {
      return { message: t("noFolder"), ok: false };
    }

    const attributes = await fetchAttributesForNode(data.taxonomyNodeId);
    const allowed = new Set(attributes.map((attr) => attr.id));
    const slots = data.slots.filter((slot) => allowed.has(slot.attributeId));

    await db.$transaction(async (tx) => {
      const layout = await tx.productPageLayout.upsert({
        where: { taxonomyNodeId: data.taxonomyNodeId },
        create: { taxonomyNodeId: data.taxonomyNodeId },
        update: {},
      });

      await tx.productPageSpecSlot.deleteMany({ where: { layoutId: layout.id } });
      if (slots.length > 0) {
        await tx.productPageSpecSlot.createMany({
          data: slots.map((slot, sortOrder) => ({
            layoutId: layout.id,
            attributeId: slot.attributeId,
            visible: slot.visible,
            sortOrder,
          })),
        });
      }
    });

    revalidatePath("/", "layout");
    revalidatePath("/admin/ui");
    return { message: t("productPageSaved"), ok: true };
  } catch (error) {
    console.error("saveProductPageLayoutAction", error);
    return { message: t("productPageSaveFailed"), ok: false };
  }
}
