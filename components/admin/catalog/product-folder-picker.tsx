"use client";

import CascadeSelect from "@/components/form/cascade-select";
import { Label } from "@/components/ui/label";
import { taxonomyToCascadeItems } from "@/lib/catalog/taxonomy";
import type { TaxonomyTreeNode } from "@/lib/catalog/types";
import { useTranslations } from "next-intl";

export default function ProductFolderPicker({
  tree,
  selectedId,
  onNodeChange,
}: {
  tree: TaxonomyTreeNode[];
  selectedId?: string;
  /** When set, folder change stays on the current page flow (e.g. create sheet). */
  onNodeChange?: (nodeId: string | null) => void;
}) {
  const t = useTranslations("CatalogAdmin");

  return (
    <div className="grid gap-2">
      <Label>{t("productFolder")}</Label>
      <CascadeSelect
        name="taxonomyNodeId"
        items={taxonomyToCascadeItems(tree)}
        value={selectedId ?? null}
        onValueChange={(id) => onNodeChange?.(id)}
        placeholder={t("templateFolderPlaceholder")}
        emptyLabel={t("emptyFolders")}
        allowEmpty
        emptyOptionLabel={t("productFolderNone")}
      />
    </div>
  );
}
