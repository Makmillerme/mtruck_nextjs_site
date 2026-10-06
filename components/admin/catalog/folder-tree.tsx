"use client";

import { useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import type { TaxonomyTreeNode } from "@/lib/catalog/types";
import { ConfirmDeleteIcon } from "@/components/form/ConfirmDelete";
import {
  createTaxonomyNodeAction,
  deleteTaxonomyNodeAction,
  moveTaxonomyNodeAction,
  renameTaxonomyNodeAction,
} from "@/utils/taxonomy-actions";
import { initialTaxonomyActionState } from "@/utils/taxonomy-action-state";
import type { actionFunction } from "@/utils/types";
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
import AdminInfoTip from "./admin-info-tip";
import CatalogForm from "./catalog-form";
import { CatalogField, CatalogFlag, CatalogSubmit } from "./catalog-fields";
import CmsPanelToolbar from "./cms-panel-toolbar";

function filterTaxonomyTree(
  nodes: TaxonomyTreeNode[],
  query: string
): TaxonomyTreeNode[] {
  const q = query.trim().toLowerCase();
  if (!q) return nodes;

  const result: TaxonomyTreeNode[] = [];
  for (const node of nodes) {
    if (node.name.toLowerCase().includes(q)) {
      result.push(node);
      continue;
    }
    const children = filterTaxonomyTree(node.children, query);
    if (children.length > 0) {
      result.push({ ...node, children });
    }
  }
  return result;
}

function collectExpandIds(nodes: TaxonomyTreeNode[], into: Set<string>) {
  for (const node of nodes) {
    if (node.children.length === 0) continue;
    into.add(node.id);
    collectExpandIds(node.children, into);
  }
}

type FolderSheet =
  | { mode: "create"; parent: TaxonomyTreeNode | null }
  | { mode: "edit"; node: TaxonomyTreeNode }
  | null;

function FolderRow({
  node,
  index,
  siblingCount,
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

  return (
    <li>
      <div className="flex h-11 items-center gap-1 rounded-sm pr-1 transition-colors hover:bg-secondary/70">
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
          {!node.showInFilter ? (
            <span className="shrink-0 text-xs text-muted-foreground">
              {t("hiddenFromFilter")}
            </span>
          ) : null}
          {node.productCount > 0 ? (
            <span className="shrink-0 text-xs text-muted-foreground">
              {node.productCount}
            </span>
          ) : null}
        </button>
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
            {node.subtreeProductCount > 0 ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-muted-foreground"
                disabled
                aria-label={t("deleteFolder")}
                title={t("deleteFolderBlocked", {
                  count: node.subtreeProductCount,
                })}
              >
                <LuTrash2 className="size-4" />
              </Button>
            ) : (
              <ConfirmDeleteIcon
                action={
                  deleteTaxonomyNodeAction as unknown as actionFunction
                }
                title={t("deleteFolderTitle")}
                description={t("deleteFolderCascade", {
                  folders: node.descendantCount,
                  fields: node.subtreeAttributeCount,
                })}
              >
                <input type="hidden" name="nodeId" value={node.id} />
              </ConfirmDeleteIcon>
            )}
          </div>
      </div>
      {hasChildren && isOpen ? (
        <ul className="ml-4 grid gap-0.5 border-l border-border pl-2">
          {node.children.map((child, childIndex) => (
            <FolderRow
              key={child.id}
              node={child}
              index={childIndex}
              siblingCount={node.children.length}
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
}: {
  tree: TaxonomyTreeNode[];
}) {
  const t = useTranslations("CatalogAdmin");
  const { toast } = useToast();
  const [movePending, startMove] = useTransition();
  const [sheet, setSheet] = useState<FolderSheet>(null);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [query, setQuery] = useState("");

  const filteredTree = useMemo(
    () => filterTaxonomyTree(tree, query),
    [tree, query]
  );

  const searching = query.trim().length > 0;

  const visibleExpanded = useMemo(() => {
    if (!searching) return expanded;
    const ids = new Set<string>();
    collectExpandIds(filteredTree, ids);
    return ids;
  }, [searching, expanded, filteredTree]);

  function toggle(id: string) {
    if (searching) return;
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function select(node: TaxonomyTreeNode) {
    toggle(node.id);
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
      <CmsPanelToolbar
        search={query}
        onSearchChange={setQuery}
        searchPlaceholder={t("folderSearchPlaceholder")}
        createLabel={t("addRootFolder")}
        onCreate={() => setSheet({ mode: "create", parent: null })}
        infoTip={
          <AdminInfoTip label={t("helpLabel")}>
            <p>{t("foldersHelp.p1")}</p>
            <p>{t("foldersHelp.p2")}</p>
            <p>{t("foldersHelp.p3")}</p>
          </AdminInfoTip>
        }
      />

      {tree.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("emptyFolders")}</p>
      ) : filteredTree.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("panelSearchEmpty")}</p>
      ) : (
        <ul className="grid gap-0.5">
          {filteredTree.map((node, index) => (
            <FolderRow
              key={node.id}
              node={node}
              index={index}
              siblingCount={filteredTree.length}
              expanded={visibleExpanded}
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
        <SheetContent>
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
                <CatalogFlag
                  name="showInFilter"
                  label={t("flagShowInFilter")}
                  defaultChecked
                />
                <CatalogSubmit text={t("createFolder")} className="w-fit" />
              </CatalogForm>
            </div>
          ) : null}
          {sheet?.mode === "edit" ? (
            <div className="grid gap-6">
              <SheetHeader>
                <SheetTitle>{t("renameFolderTitle")}</SheetTitle>
                <SheetDescription>{sheet.node.name}</SheetDescription>
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
                <CatalogFlag
                  name="showInFilter"
                  label={t("flagShowInFilter")}
                  defaultChecked={sheet.node.showInFilter}
                />
                <CatalogSubmit text={t("saveFolder")} className="w-fit" />
              </CatalogForm>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
