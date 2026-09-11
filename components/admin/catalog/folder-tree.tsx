import FormContainer from "@/components/form/FormContainer";
import { IconButton, SubmitButton } from "@/components/form/Buttons";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { TaxonomyTreeNode } from "@/lib/catalog/types";
import {
  createTaxonomyNodeAction,
  deleteTaxonomyNodeAction,
} from "@/utils/taxonomy-actions";
import { getTranslations } from "next-intl/server";
import { LuFolder, LuFolderOpen } from "react-icons/lu";
import { CatalogField } from "./catalog-fields";

function FolderBranch({
  node,
  selectedId,
  deleteLabel,
}: {
  node: TaxonomyTreeNode;
  selectedId?: string;
  deleteLabel: string;
}) {
  const selected = node.id === selectedId;
  const Icon = selected || node.children.length > 0 ? LuFolderOpen : LuFolder;
  return (
    <li className="grid gap-1">
      <div
        className={cn(
          "flex items-center gap-1 rounded-sm",
          selected && "bg-muted"
        )}
      >
        <Link
          href={`/admin/catalog?node=${node.id}`}
          className="flex min-w-0 flex-1 items-center gap-2 px-2 py-1.5 text-sm"
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span className="truncate">{node.name}</span>
        </Link>
        {node.children.length === 0 && node.productCount === 0 ? (
          <FormContainer action={deleteTaxonomyNodeAction}>
            <input type="hidden" name="nodeId" value={node.id} />
            <span className="sr-only">{deleteLabel}</span>
            <IconButton actionType="delete" />
          </FormContainer>
        ) : null}
      </div>
      {node.children.length > 0 ? (
        <ul className="grid gap-1 border-l border-border pl-3 ml-3">
          {node.children.map((child) => (
            <FolderBranch
              key={child.id}
              node={child}
              selectedId={selectedId}
              deleteLabel={deleteLabel}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export default async function FolderTree({
  tree,
  selectedId,
}: {
  tree: TaxonomyTreeNode[];
  selectedId?: string;
}) {
  const t = await getTranslations("CatalogAdmin");
  return (
    <div className="grid gap-4">
      <FormContainer action={createTaxonomyNodeAction}>
        <div className="grid gap-3">
          <CatalogField name="name" label={t("rootFolderName")} />
          <SubmitButton text={t("addRootFolder")} size="sm" className="w-fit" />
        </div>
      </FormContainer>
      {tree.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("emptyFolders")}</p>
      ) : (
        <ul className="grid gap-1">
          {tree.map((node) => (
            <FolderBranch
              key={node.id}
              node={node}
              selectedId={selectedId}
              deleteLabel={t("deleteFolder")}
            />
          ))}
        </ul>
      )}
      {selectedId ? (
        <Button asChild variant="outline" size="sm" className="w-fit">
          <Link href="/admin/catalog">{t("clearSelection")}</Link>
        </Button>
      ) : null}
    </div>
  );
}
