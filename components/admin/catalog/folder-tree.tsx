"use client";

import { useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import type { TaxonomyTreeNode } from "@/lib/catalog/types";
import {
  createTaxonomyNodeAction,
  deleteTaxonomyNodeAction,
  moveTaxonomyNodeAction,
  renameTaxonomyNodeAction,
} from "@/utils/taxonomy-actions";
import { initialTaxonomyActionState } from "@/utils/taxonomy-action-state";
import {
  LuArrowDown,
  LuArrowUp,
  LuChevronDown,
  LuChevronRight,
  LuFolder,
  LuPen,
  LuPlus,
  LuTrash2,
} from "react-icons/lu";
import CatalogForm from "./catalog-form";
import { CatalogField, CatalogSubmit } from "./catalog-fields";

type FolderSheet =
  | { mode: "create"; parent: TaxonomyTreeNode | null }
  | { mode: "edit"; node: TaxonomyTreeNode }
  | { mode: "delete"; node: TaxonomyTreeNode }
  | null;

function findAncestorIds(
  nodes: TaxonomyTreeNode[],
  targetId: string,
  trail: string[] = []
): string[] | null {
  for (const node of nodes) {
    if (node.id === targetId) return trail;
    const found = findAncestorIds(node.children, targetId, [...trail, node.id]);
    if (found) return found;
  }
  return null;
}

function FolderRow({
  node,
  index,
  siblingCount,
  mode,
  selectedId,
  expanded,
  onToggle,
  onSelect,
  onMove,
  onSheet,
  movePending,
}: {
  node: TaxonomyTreeNode;
  index: number;
  siblingCount: number;
  mode: "manage" | "pick";
  selectedId?: string;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (node: TaxonomyTreeNode) => void;
  onMove: (nodeId: string, direction: "up" | "down") => void;
  onSheet: (sheet: FolderSheet) => void;
  movePending: boolean;
}) {
  const t = useTranslations("CatalogAdmin");
  const hasChildren = node.children.length > 0;
  const isOpen = expanded.has(node.id);
  const isSelected = node.id === selectedId;

  return (
    <li>
      <div
        className={cn(
          "flex h-11 items-center gap-1 rounded-sm pr-1 transition-colors hover:bg-secondary/70",
          isSelected && "bg-secondary"
        )}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 text-muted-foreground hover:bg-transparent hover:text-muted-foreground"
          onClick={() => onToggle(node.id)}
          disabled={!hasChildren}
          aria-expanded={hasChildren ? isOpen : undefined}
          aria-label={t("toggleFolder")}
        >
          {hasChildren ? (
            isOpen ? (
              <LuChevronDown className="size-4" />
            ) : (
              <LuChevronRight className="size-4" />
            )
          ) : (
            <LuFolder className="size-4 opacity-40" />
          )}
        </Button>
        <button
          type="button"
          onClick={() => onSelect(node)}
          className="flex min-w-0 flex-1 items-center gap-2 py-2 text-left text-sm"
        >
          <span className="truncate">{node.name}</span>
          {node.productCount > 0 ? (
            <span className="shrink-0 text-xs text-muted-foreground">
              {node.productCount}
            </span>
          ) : null}
        </button>
        {mode === "manage" ? (
          <div className="flex shrink-0 items-center">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              disabled={index === 0 || movePending}
              onClick={() => onMove(node.id, "up")}
              aria-label={t("moveUp")}
              title={t("moveUp")}
            >
              <LuArrowUp className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              disabled={index === siblingCount - 1 || movePending}
              onClick={() => onMove(node.id, "down")}
              aria-label={t("moveDown")}
              title={t("moveDown")}
            >
              <LuArrowDown className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onSheet({ mode: "create", parent: node })}
              aria-label={t("addChildFolder")}
              title={t("addChildFolder")}
            >
              <LuPlus className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              onClick={() => onSheet({ mode: "edit", node })}
              aria-label={t("renameFolder")}
              title={t("renameFolder")}
            >
              <LuPen className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              onClick={() => onSheet({ mode: "delete", node })}
              aria-label={t("deleteFolder")}
              title={t("deleteFolder")}
            >
              <LuTrash2 className="size-4" />
            </Button>
          </div>
        ) : null}
      </div>
      {hasChildren && isOpen ? (
        <ul className="ml-4 grid gap-0.5 border-l border-border pl-2">
          {node.children.map((child, childIndex) => (
            <FolderRow
              key={child.id}
              node={child}
              index={childIndex}
              siblingCount={node.children.length}
              mode={mode}
              selectedId={selectedId}
              expanded={expanded}
              onToggle={onToggle}
              onSelect={onSelect}
              onMove={onMove}
              onSheet={onSheet}
              movePending={movePending}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export default function FolderTree({
  tree,
  selectedId,
  mode = "manage",
}: {
  tree: TaxonomyTreeNode[];
  selectedId?: string;
  mode?: "manage" | "pick";
}) {
  const t = useTranslations("CatalogAdmin");
  const router = useRouter();
  const { toast } = useToast();
  const [movePending, startMove] = useTransition();
  const [sheet, setSheet] = useState<FolderSheet>(null);
  const initialExpanded = useMemo(() => {
    const ids = selectedId ? findAncestorIds(tree, selectedId) ?? [] : [];
    return new Set(ids);
  }, [tree, selectedId]);
  const [expanded, setExpanded] = useState<Set<string>>(initialExpanded);

  function toggle(id: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function select(node: TaxonomyTreeNode) {
    toggle(node.id);
    if (mode === "pick") {
      router.push(`/admin/catalog?tab=fields&node=${node.id}`);
    }
  }

  function move(nodeId: string, direction: "up" | "down") {
    const formData = new FormData();
    formData.set("nodeId", nodeId);
    formData.set("direction", direction);
    startMove(async () => {
      const result = await moveTaxonomyNodeAction(
        initialTaxonomyActionState,
        formData
      );
      if (result.message && !result.ok) {
        toast({ description: result.message, variant: "destructive" });
      }
    });
  }

  return (
    <div className="grid gap-4">
      {mode === "manage" ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">{t("foldersLede")}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => setSheet({ mode: "create", parent: null })}
          >
            <LuPlus className="size-4" />
            {t("addRootFolder")}
          </Button>
        </div>
      ) : null}

      {tree.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("emptyFolders")}</p>
      ) : (
        <ul className="grid gap-0.5">
          {tree.map((node, index) => (
            <FolderRow
              key={node.id}
              node={node}
              index={index}
              siblingCount={tree.length}
              mode={mode}
              selectedId={selectedId}
              expanded={expanded}
              onToggle={toggle}
              onSelect={select}
              onMove={move}
              onSheet={setSheet}
              movePending={movePending}
            />
          ))}
        </ul>
      )}

      <Sheet
        open={sheet !== null}
        onOpenChange={(open) => {
          if (!open) setSheet(null);
        }}
      >
        <SheetContent className="w-full sm:max-w-md">
          {sheet?.mode === "create" ? (
            <div className="grid gap-6">
              <SheetHeader>
                <SheetTitle>
                  {sheet.parent
                    ? t("newChildFolderTitle", { parent: sheet.parent.name })
                    : t("newRootFolderTitle")}
                </SheetTitle>
                <SheetDescription>{t("newFolderHint")}</SheetDescription>
              </SheetHeader>
              <CatalogForm
                className="grid gap-4"
                action={createTaxonomyNodeAction}
                onSuccess={() => setSheet(null)}
              >
                {sheet.parent ? (
                  <input type="hidden" name="parentId" value={sheet.parent.id} />
                ) : null}
                <CatalogField name="name" label={t("folderName")} />
                <CatalogSubmit text={t("createFolder")} className="w-fit" />
              </CatalogForm>
            </div>
          ) : null}

          {sheet?.mode === "edit" ? (
            <div className="grid gap-6">
              <SheetHeader>
                <SheetTitle>{t("renameFolder")}</SheetTitle>
                <SheetDescription>
                  {t("slugLabel", { slug: sheet.node.slug })}
                </SheetDescription>
              </SheetHeader>
              <CatalogForm
                className="grid gap-4"
                action={renameTaxonomyNodeAction}
                onSuccess={() => setSheet(null)}
              >
                <input type="hidden" name="nodeId" value={sheet.node.id} />
                <CatalogField
                  name="name"
                  label={t("folderName")}
                  defaultValue={sheet.node.name}
                />
                <CatalogSubmit text={t("saveFolder")} className="w-fit" />
              </CatalogForm>
            </div>
          ) : null}

          {sheet?.mode === "delete" ? (
            <div className="grid gap-6">
              <SheetHeader>
                <SheetTitle>{t("deleteFolderTitle")}</SheetTitle>
                <SheetDescription>
                  {t("deleteFolderSubject", { folder: sheet.node.name })}
                </SheetDescription>
              </SheetHeader>
              {sheet.node.subtreeProductCount > 0 ? (
                <div className="grid gap-4">
                  <p className="text-sm text-destructive">
                    {t("deleteFolderBlocked", {
                      count: sheet.node.subtreeProductCount,
                    })}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-fit"
                    onClick={() => setSheet(null)}
                  >
                    {t("cancel")}
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  <p className="text-sm text-muted-foreground">
                    {t("deleteFolderCascade", {
                      folders: sheet.node.descendantCount,
                      fields: sheet.node.subtreeAttributeCount,
                    })}
                  </p>
                  <CatalogForm
                    className="flex items-center gap-3"
                    action={deleteTaxonomyNodeAction}
                    onSuccess={() => setSheet(null)}
                  >
                    <input type="hidden" name="nodeId" value={sheet.node.id} />
                    <CatalogSubmit
                      text={t("confirmDelete")}
                      variant="destructive"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSheet(null)}
                    >
                      {t("cancel")}
                    </Button>
                  </CatalogForm>
                </div>
              )}
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
