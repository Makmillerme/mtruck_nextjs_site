"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [activeTab, setActiveTab] = useState<CmsTab>(tab);

  function openTab(value: string) {
    const next: CmsTab = value === "fields" ? "fields" : "folders";
    setActiveTab(next);
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("tab", next);
    if (next === "fields" && nodeId) {
      url.searchParams.set("node", nodeId);
    } else if (next === "folders") {
      // keep node in URL for fields deep-link, but don't require it for folders
    }
    window.history.replaceState(null, "", url.toString());
  }

  return (
    <Tabs value={activeTab} onValueChange={openTab}>
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
