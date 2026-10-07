"use server";

import { ensureHomeFinderSettings } from "@/lib/home/home-finder";
import { HOME_FINDER_SETTINGS_ID } from "@/lib/home/home-finder-shared";
import { revalidatePublicCatalog } from "@/lib/catalog/cache";
import { fetchTaxonomyTree } from "@/lib/catalog/taxonomy";
import {
  updateHomeFinderSettingsSchema,
  type UpdateHomeFinderSettingsInput,
} from "@/utils/home-finder-schema";
import db from "@/utils/db";
import { getAdminUser } from "@/utils/session";
import { validateWithZodSchema } from "@/utils/schemas";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";

type ActionResult =
  | { ok: true }
  | { ok: false; message: string };

export async function updateHomeFinderSettingsAction(
  input: UpdateHomeFinderSettingsInput
): Promise<ActionResult> {
  await getAdminUser();
  const t = await getTranslations("Actions");

  try {
    const data = validateWithZodSchema(updateHomeFinderSettingsSchema, input);
    const tree = await fetchTaxonomyTree();

    for (const rootId of data.rootIds) {
      if (!tree.some((node) => node.id === rootId)) {
        return { ok: false, message: t("error") };
      }
    }

    if (data.defaultRootId) {
      if (!tree.some((node) => node.id === data.defaultRootId)) {
        return { ok: false, message: t("error") };
      }
      if (
        data.rootIds.length > 0 &&
        !data.rootIds.includes(data.defaultRootId)
      ) {
        return { ok: false, message: t("error") };
      }
    }

    if (data.defaultChildId) {
      const parentRoot = tree.find((root) =>
        root.children.some((child) => child.id === data.defaultChildId)
      );
      if (!parentRoot) {
        return { ok: false, message: t("error") };
      }
      if (data.defaultRootId && parentRoot.id !== data.defaultRootId) {
        return { ok: false, message: t("error") };
      }
      if (
        data.rootIds.length > 0 &&
        !data.rootIds.includes(parentRoot.id)
      ) {
        return { ok: false, message: t("error") };
      }
    }

    await ensureHomeFinderSettings();
    await db.homeFinderSettings.update({
      where: { id: HOME_FINDER_SETTINGS_ID },
      data: {
        showRootsBlock: data.showRootsBlock,
        rootIds: data.rootIds,
        defaultRootId: data.defaultRootId,
        defaultChildId: data.defaultChildId,
      },
    });

    revalidatePath("/admin/ui");
    revalidatePath("/");
    revalidatePublicCatalog();
    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false, message: t("error") };
  }
}
