"use server";

import {
  CARD_PREVIEW_CATEGORY_SOURCES,
  CARD_PREVIEW_GRID_COUNT_MAX,
  CARD_PREVIEW_GRID_COUNT_MIN,
  CARD_PREVIEW_SLOT_MAX,
  CARD_PREVIEW_SPECS_STYLES,
  CARD_PREVIEW_SUBTITLE_FIELD_MAX,
  clampSpecsGridCount,
  type CardPreviewCategorySourceId,
  type CardPreviewSpecsStyleId,
} from "@/lib/catalog/card-preview";
import { fetchAttributesForNode } from "@/lib/catalog/taxonomy";
import db from "@/utils/db";
import { getAdminUser } from "@/utils/session";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const saveSchema = z.object({
  taxonomyNodeId: z.string().uuid(),
  showName: z.boolean(),
  showPrice: z.boolean(),
  showStatus: z.boolean(),
  showSubtitle: z.boolean(),
  showSpecs: z.boolean(),
  specsStyle: z.enum(["GRID", "TAGS"]),
  specsGridCount: z
    .number()
    .int()
    .min(CARD_PREVIEW_GRID_COUNT_MIN)
    .max(CARD_PREVIEW_GRID_COUNT_MAX),
  categorySource: z.enum(["LAYOUT_FOLDER", "PRODUCT_FOLDER"]),
  slotAttributeIds: z.array(z.string().uuid()).max(CARD_PREVIEW_SLOT_MAX),
  subtitleAttributeIds: z
    .array(z.string().uuid())
    .max(CARD_PREVIEW_SUBTITLE_FIELD_MAX),
});

export type SaveCardPreviewState = {
  message: string;
  ok?: boolean;
};

export async function saveCardPreviewLayoutAction(
  input: z.infer<typeof saveSchema>
): Promise<SaveCardPreviewState> {
  await getAdminUser();
  const t = await getTranslations("UiEditor");
  try {
    const data = saveSchema.parse(input);
    const specsStyle = data.specsStyle as CardPreviewSpecsStyleId;
    const categorySource = data.categorySource as CardPreviewCategorySourceId;
    const specsGridCount = clampSpecsGridCount(data.specsGridCount);
    if (!CARD_PREVIEW_SPECS_STYLES.includes(specsStyle)) {
      return { message: "Invalid style", ok: false };
    }
    if (!CARD_PREVIEW_CATEGORY_SOURCES.includes(categorySource)) {
      return { message: "Invalid category source", ok: false };
    }
    const node = await db.taxonomyNode.findUnique({
      where: { id: data.taxonomyNodeId },
      select: { id: true },
    });
    if (!node) {
      return { message: t("noFolder"), ok: false };
    }

    const attributes = await fetchAttributesForNode(data.taxonomyNodeId);
    const allowed = new Set(attributes.map((attr) => attr.id));
    // Persist the full ordered list; GRID count / TAGS only gate card display.
    const slotIds = data.slotAttributeIds
      .filter((id) => allowed.has(id))
      .slice(0, CARD_PREVIEW_SLOT_MAX);
    const subtitleIds = data.subtitleAttributeIds
      .filter((id) => allowed.has(id))
      .slice(0, CARD_PREVIEW_SUBTITLE_FIELD_MAX);

    await db.$transaction(async (tx) => {
      const layout = await tx.cardPreviewLayout.upsert({
        where: { taxonomyNodeId: data.taxonomyNodeId },
        create: {
          taxonomyNodeId: data.taxonomyNodeId,
          showName: data.showName,
          showPrice: data.showPrice,
          showStatus: data.showStatus,
          showSubtitle: data.showSubtitle,
          showSpecs: data.showSpecs,
          specsStyle,
          specsGridCount,
          categorySource,
        },
        update: {
          showName: data.showName,
          showPrice: data.showPrice,
          showStatus: data.showStatus,
          showSubtitle: data.showSubtitle,
          showSpecs: data.showSpecs,
          specsStyle,
          specsGridCount,
          categorySource,
        },
      });

      await tx.cardPreviewSlot.deleteMany({ where: { layoutId: layout.id } });
      if (slotIds.length > 0) {
        await tx.cardPreviewSlot.createMany({
          data: slotIds.map((attributeId, sortOrder) => ({
            layoutId: layout.id,
            attributeId,
            sortOrder,
          })),
        });
      }

      await tx.cardPreviewSubtitleSlot.deleteMany({
        where: { layoutId: layout.id },
      });
      if (subtitleIds.length > 0) {
        await tx.cardPreviewSubtitleSlot.createMany({
          data: subtitleIds.map((attributeId, sortOrder) => ({
            layoutId: layout.id,
            attributeId,
            sortOrder,
          })),
        });
      }
    });

    revalidatePath("/", "layout");
    revalidatePath("/admin/ui");
    revalidatePath("/products");
    return { message: t("layoutSaved"), ok: true };
  } catch (error) {
    if (error instanceof Error && error.message) {
      return { message: error.message, ok: false };
    }
    return { message: "Error", ok: false };
  }
}
