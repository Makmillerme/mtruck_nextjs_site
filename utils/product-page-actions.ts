"use server";

import {
  clampKeyFactsMax,
  isTextAreaTabEligibleAttribute,
  KEY_FACTS_MAX_MAX,
  KEY_FACTS_MAX_MIN,
} from "@/lib/catalog/product-page-layout";
import {
  fetchAttributesForNode,
  isLeafTaxonomyNodeId,
} from "@/lib/catalog/taxonomy";
import db from "@/utils/db";
import { getAdminUser } from "@/utils/session";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const keyFactSlotSchema = z.object({
  attributeId: z.string().uuid(),
  visible: z.boolean(),
});

const tabSlotSchema = z.object({
  attributeId: z.string().uuid().nullable().optional(),
  systemSource: z.enum(["DESCRIPTION"]).nullable().optional(),
  visible: z.boolean(),
});

const tabSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1).max(80),
  kind: z.enum(["TEXT", "TABLE", "LIST"]),
  slots: z.array(tabSlotSchema).max(200),
});

const saveSchema = z.object({
  taxonomyNodeId: z.string().uuid(),
  keyFactsMax: z.number().int().min(KEY_FACTS_MAX_MIN).max(KEY_FACTS_MAX_MAX),
  keyFactSlots: z.array(keyFactSlotSchema).max(200),
  tabs: z.array(tabSchema).max(40),
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
    if (!(await isLeafTaxonomyNodeId(data.taxonomyNodeId))) {
      return { message: t("leafFolderOnly"), ok: false };
    }

    const attributes = await fetchAttributesForNode(data.taxonomyNodeId);
    const allowed = new Set(attributes.map((attr) => attr.id));
    const byAttrId = new Map(attributes.map((attr) => [attr.id, attr]));
    const keyFactsMax = clampKeyFactsMax(data.keyFactsMax);
    const keyFactSlots = data.keyFactSlots.filter((slot) =>
      allowed.has(slot.attributeId)
    );

    const tabs = data.tabs.map((tab) => {
      if (tab.kind === "TEXT") {
        const first = tab.slots.find((slot) => {
          if (!slot.visible) return false;
          if (slot.systemSource === "DESCRIPTION") return true;
          if (!slot.attributeId || !allowed.has(slot.attributeId)) return false;
          const attr = byAttrId.get(slot.attributeId);
          return Boolean(
            attr &&
              isTextAreaTabEligibleAttribute({
                id: attr.id,
                key: attr.key,
                type: attr.type,
                textInput: attr.textInput,
              })
          );
        });
        // Always persist a source — empty TEXT tabs never render on PDP.
        const slots = [
          first?.systemSource === "DESCRIPTION" || !first
            ? {
                attributeId: null as string | null,
                systemSource: "DESCRIPTION" as const,
                visible: true,
              }
            : {
                attributeId: first.attributeId!,
                systemSource: null as null,
                visible: true,
              },
        ];
        return { ...tab, slots };
      }

      const slots = tab.slots.filter((slot) => {
        if (slot.systemSource === "DESCRIPTION") return false;
        return Boolean(slot.attributeId && allowed.has(slot.attributeId));
      });
      return { ...tab, slots };
    });

    await db.$transaction(async (tx) => {
      const layout = await tx.productPageLayout.upsert({
        where: { taxonomyNodeId: data.taxonomyNodeId },
        create: {
          taxonomyNodeId: data.taxonomyNodeId,
          keyFactsMax,
        },
        update: { keyFactsMax },
      });

      await tx.productPageKeyFactSlot.deleteMany({
        where: { layoutId: layout.id },
      });
      if (keyFactSlots.length > 0) {
        await tx.productPageKeyFactSlot.createMany({
          data: keyFactSlots.map((slot, sortOrder) => ({
            layoutId: layout.id,
            attributeId: slot.attributeId,
            visible: slot.visible,
            sortOrder,
          })),
        });
      }

      await tx.productPageTab.deleteMany({ where: { layoutId: layout.id } });

      for (const [tabIndex, tab] of tabs.entries()) {
        const created = await tx.productPageTab.create({
          data: {
            layoutId: layout.id,
            name: tab.name,
            kind: tab.kind,
            sortOrder: tabIndex,
          },
        });
        if (tab.slots.length > 0) {
          await tx.productPageTabSlot.createMany({
            data: tab.slots.map((slot, sortOrder) => ({
              tabId: created.id,
              attributeId:
                slot.systemSource === "DESCRIPTION"
                  ? null
                  : (slot.attributeId ?? null),
              systemSource:
                slot.systemSource === "DESCRIPTION" ? "DESCRIPTION" : null,
              visible: slot.visible,
              sortOrder,
            })),
          });
        }
      }

      // Legacy SpecSlots = first TABLE tab (compat for old readers).
      const tableTab = tabs.find((tab) => tab.kind === "TABLE");
      await tx.productPageSpecSlot.deleteMany({ where: { layoutId: layout.id } });
      const legacySlots =
        tableTab?.slots.filter(
          (slot) => slot.attributeId && allowed.has(slot.attributeId)
        ) ?? [];
      if (legacySlots.length > 0) {
        await tx.productPageSpecSlot.createMany({
          data: legacySlots.map((slot, sortOrder) => ({
            layoutId: layout.id,
            attributeId: slot.attributeId!,
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
