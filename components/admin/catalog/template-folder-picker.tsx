"use client";

import CascadeSelect from "@/components/form/cascade-select";
import { useRouter } from "@/i18n/navigation";
import { taxonomyToCascadeItems } from "@/lib/catalog/taxonomy";
import type { TaxonomyTreeNode } from "@/lib/catalog/types";
import { useTranslations } from "next-intl";

export default function TemplateFolderPicker({
  tree,
  selectedId,
}: {
  tree: TaxonomyTreeNode[];
  selectedId?: string;
}) {
  const t = useTranslations("CatalogAdmin");
  const router = useRouter();

  return (
    <CascadeSelect
      items={taxonomyToCascadeItems(tree)}
      value={selectedId ?? null}
      onValueChange={(id) => {
        router.push(
          id
            ? `/admin/catalog?tab=fields&node=${id}`
            : "/admin/catalog?tab=fields"
        );
      }}
      placeholder={t("templateFolderPlaceholder")}
      emptyLabel={t("emptyFolders")}
    />
  );
}
