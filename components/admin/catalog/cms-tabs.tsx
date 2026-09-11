"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CmsTabs({
  tab,
  nodeId,
  folders,
  fields,
}: {
  tab: "folders" | "fields";
  nodeId?: string;
  folders: ReactNode;
  fields: ReactNode;
}) {
  const t = useTranslations("CatalogAdmin");
  const router = useRouter();

  function openTab(value: string) {
    const keepNode = value === "fields" && nodeId ? `&node=${nodeId}` : "";
    router.push(`/admin/catalog?tab=${value}${keepNode}`);
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
      <TabsContent value="folders" className="mt-6">
        {folders}
      </TabsContent>
      <TabsContent value="fields" className="mt-6">
        {fields}
      </TabsContent>
    </Tabs>
  );
}
