"use client";

import { useRouter } from "@/i18n/navigation";
import { Label } from "@/components/ui/label";
import { catalogSelectClassName } from "@/components/admin/catalog/catalog-fields";
import { useTranslations } from "next-intl";

export default function ProductFolderPicker({
  folders,
  selectedId,
  onNodeChange,
}: {
  folders: { id: string; name: string; depth: number }[];
  selectedId?: string;
  /** When set, folder change stays on the current page flow (e.g. create sheet). */
  onNodeChange?: (nodeId: string | null) => void;
}) {
  const t = useTranslations("CatalogAdmin");
  const router = useRouter();

  return (
    <div className="grid gap-2">
      <Label htmlFor="taxonomyNodeId">{t("productFolder")}</Label>
      <select
        id="taxonomyNodeId"
        name="taxonomyNodeId"
        className={catalogSelectClassName}
        value={selectedId ?? ""}
        onChange={(event) => {
          const id = event.target.value || null;
          if (onNodeChange) {
            onNodeChange(id);
            return;
          }
          router.push(
            id ? `/admin/products?create=1&node=${id}` : "/admin/products?create=1"
          );
        }}
      >
        <option value="">{t("productFolderNone")}</option>
        {folders.map((folder) => (
          <option key={folder.id} value={folder.id}>
            {`${"— ".repeat(folder.depth)}${folder.name}`}
          </option>
        ))}
      </select>
    </div>
  );
}
