"use client";

import type { ReactNode } from "react";
import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { SoftNavPending } from "@/components/soft-nav/soft-nav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "@/i18n/navigation";
import {
  parseUiEditorTab,
  type UiEditorTab,
} from "@/lib/admin/ui-editor-tab";

export type { UiEditorTab };
export { parseUiEditorTab };

export default function UiEditorTabs({
  tab,
  nodeId,
  filter,
  cardPreview,
  productCard,
  layout,
}: {
  tab: UiEditorTab;
  nodeId?: string;
  filter: ReactNode;
  cardPreview: ReactNode;
  productCard: ReactNode;
  layout: ReactNode;
}) {
  const t = useTranslations("UiEditor");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function openTab(value: string) {
    const next = parseUiEditorTab(value);
    if (next === tab) return;
    const params = new URLSearchParams();
    params.set("tab", next);
    if (nodeId) params.set("node", nodeId);
    startTransition(() => {
      router.replace(`/admin/ui?${params.toString()}`);
    });
  }

  return (
    <Tabs value={tab} onValueChange={openTab}>
      <TabsList className="w-full sm:w-full">
        <TabsTrigger value="filter" className="sm:flex-1">
          {t("tabFilter")}
        </TabsTrigger>
        <TabsTrigger value="cardPreview" className="sm:flex-1">
          {t("tabCardPreview")}
        </TabsTrigger>
        <TabsTrigger value="productCard" className="sm:flex-1">
          {t("tabProductCard")}
        </TabsTrigger>
        <TabsTrigger value="layout" className="sm:flex-1">
          {t("tabLayout")}
        </TabsTrigger>
      </TabsList>
      <SoftNavPending isPending={isPending}>
        <TabsContent value="filter" className="mt-6">
          {filter}
        </TabsContent>
        <TabsContent value="cardPreview" className="mt-6">
          {cardPreview}
        </TabsContent>
        <TabsContent value="productCard" className="mt-6">
          {productCard}
        </TabsContent>
        <TabsContent value="layout" className="mt-6">
          {layout}
        </TabsContent>
      </SoftNavPending>
    </Tabs>
  );
}
