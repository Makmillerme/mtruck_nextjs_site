"use client";

import type { ReactNode } from "react";
import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { SoftNavPending } from "@/components/soft-nav/soft-nav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "@/i18n/navigation";

type CmsTab = "folders" | "fields";

export default function CmsTabs({
  tab,
  nodeId,
  folders,
  fields,
}: {
  tab: CmsTab;
  nodeId?: string;
  folders: ReactNode;
  fields: ReactNode;
}) {
  const t = useTranslations("CatalogAdmin");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function openTab(value: string) {
    const next: CmsTab = value === "fields" ? "fields" : "folders";
    if (next === tab) return;
    const params = new URLSearchParams();
    params.set("tab", next);
    if (next === "fields" && nodeId) {
      params.set("node", nodeId);
    } else if (nodeId) {
      // keep node for fields deep-link when switching back
      params.set("node", nodeId);
    }
    startTransition(() => {
      router.replace(`/admin/catalog?${params.toString()}`);
    });
  }

  return (
    <Tabs value={tab} onValueChange={openTab}>
      <TabsList className="w-full sm:w-full">
        <TabsTrigger value="folders" className="sm:flex-1">
          {t("tabFolders")}
        </TabsTrigger>
        <TabsTrigger value="fields" className="sm:flex-1">
          {t("tabFields")}
        </TabsTrigger>
      </TabsList>
      <SoftNavPending isPending={isPending}>
        <TabsContent value="folders" className="mt-6">
          {folders}
        </TabsContent>
        <TabsContent value="fields" className="mt-6">
          {fields}
        </TabsContent>
      </SoftNavPending>
    </Tabs>
  );
}
