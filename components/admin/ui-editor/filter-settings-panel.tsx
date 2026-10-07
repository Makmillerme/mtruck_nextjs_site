"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import CascadeSelect from "@/components/form/cascade-select";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { SoftNavPending } from "@/components/soft-nav/soft-nav";
import { useRouter } from "@/i18n/navigation";
import { findNodeInTree, taxonomyToCascadeItems } from "@/lib/catalog/taxonomy";
import type { CatalogAttribute, TaxonomyTreeNode } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";
import {
  setAttributeIsFacetAction,
  setNodeShowInFilterAction,
} from "@/utils/taxonomy-actions";

export type FilterSettingsAttribute = Pick<
  CatalogAttribute,
  "id" | "name" | "key" | "type" | "isFacet"
>;

export default function FilterSettingsPanel({
  tree,
  selectedNodeId,
  attributes,
  tab,
}: {
  tree: TaxonomyTreeNode[];
  selectedNodeId?: string;
  attributes: FilterSettingsAttribute[];
  tab: string;
}) {
  const t = useTranslations("UiEditor");
  const tCatalog = useTranslations("CatalogAdmin");
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [folderBusy, setFolderBusy] = useState(false);
  const [facetBusyId, setFacetBusyId] = useState<string | null>(null);

  const selectedNode = useMemo(
    () =>
      selectedNodeId ? findNodeInTree(tree, selectedNodeId) : null,
    [tree, selectedNodeId]
  );

  const [showInFilter, setShowInFilter] = useState(
    selectedNode?.showInFilter ?? true
  );
  const [facetMap, setFacetMap] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(attributes.map((item) => [item.id, item.isFacet]))
  );

  const attributesSignature = attributes
    .map((item) => `${item.id}:${item.isFacet ? 1 : 0}`)
    .join(",");

  useEffect(() => {
    setShowInFilter(selectedNode?.showInFilter ?? true);
  }, [selectedNode?.id, selectedNode?.showInFilter]);

  useEffect(() => {
    setFacetMap(
      Object.fromEntries(attributes.map((item) => [item.id, item.isFacet]))
    );
  }, [selectedNode?.id, attributesSignature, attributes]);

  function selectFolder(nodeId: string | null) {
    const params = new URLSearchParams();
    params.set("tab", tab);
    if (nodeId) params.set("node", nodeId);
    startTransition(() => {
      router.replace(`/admin/ui?${params.toString()}`);
    });
  }

  async function onToggleFolder(next: boolean) {
    if (!selectedNode) return;
    const prev = showInFilter;
    setShowInFilter(next);
    setFolderBusy(true);
    const result = await setNodeShowInFilterAction({
      nodeId: selectedNode.id,
      showInFilter: next,
    });
    setFolderBusy(false);
    if (!result.ok) {
      setShowInFilter(prev);
      toast({ variant: "destructive", description: result.message });
      return;
    }
    startTransition(() => router.refresh());
  }

  async function onToggleFacet(attribute: FilterSettingsAttribute, next: boolean) {
    if (attribute.type === "TEXT") return;
    const prev = facetMap[attribute.id] ?? attribute.isFacet;
    setFacetMap((current) => ({ ...current, [attribute.id]: next }));
    setFacetBusyId(attribute.id);
    const result = await setAttributeIsFacetAction({
      attributeId: attribute.id,
      isFacet: next,
    });
    setFacetBusyId(null);
    if (!result.ok) {
      setFacetMap((current) => ({ ...current, [attribute.id]: prev }));
      toast({ variant: "destructive", description: result.message });
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <SoftNavPending isPending={isPending}>
      <Card className="shadow-sm">
        <CardContent className="grid gap-6 pt-6">
          <div className="grid gap-2">
            <h2 className="text-base font-semibold tracking-tight">
              {t("filterTitle")}
            </h2>
            <p className="text-sm text-muted-foreground">{t("filterLede")}</p>
          </div>

          <div className="grid gap-2">
            <Label>{t("filterFolder")}</Label>
            <CascadeSelect
              items={taxonomyToCascadeItems(tree)}
              value={selectedNodeId ?? null}
              onValueChange={selectFolder}
              placeholder={tCatalog("templateFolderPlaceholder")}
              emptyLabel={tCatalog("emptyFolders")}
              allowEmpty
              emptyOptionLabel={t("filterFolderUnset")}
              variant="tree"
            />
          </div>

          {!selectedNode ? (
            <p className="text-sm text-muted-foreground">{t("filterPickFolder")}</p>
          ) : (
            <>
              <label
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-sm border p-3",
                  folderBusy && "pointer-events-none opacity-60"
                )}
              >
                <Checkbox
                  checked={showInFilter}
                  disabled={folderBusy}
                  onCheckedChange={(value) => onToggleFolder(value === true)}
                  className="mt-0.5"
                />
                <span className="grid min-w-0 gap-1">
                  <span className="text-sm font-medium">
                    {tCatalog("flagShowInFilter")}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t("filterFolderHint")}
                  </span>
                </span>
              </label>

              <div className="grid gap-3">
                <div className="grid gap-1">
                  <p className="text-sm font-medium">{t("filterFieldsTitle")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("filterFieldsLede")}
                  </p>
                </div>

                {attributes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t("filterNoFields")}
                  </p>
                ) : (
                  <ul className="grid gap-2">
                    {attributes.map((attribute) => {
                      const isText = attribute.type === "TEXT";
                      const checked = isText
                        ? false
                        : (facetMap[attribute.id] ?? attribute.isFacet);
                      const busy = facetBusyId === attribute.id;
                      return (
                        <li key={attribute.id}>
                          <label
                            className={cn(
                              "flex items-start gap-3 rounded-sm border p-3",
                              isText
                                ? "cursor-not-allowed opacity-70"
                                : "cursor-pointer",
                              busy && "pointer-events-none opacity-60"
                            )}
                          >
                            <Checkbox
                              checked={checked}
                              disabled={isText || busy}
                              onCheckedChange={(value) =>
                                onToggleFacet(attribute, value === true)
                              }
                              className="mt-0.5"
                            />
                            <span className="grid min-w-0 flex-1 gap-0.5">
                              <span className="text-sm font-medium">
                                {attribute.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {attribute.key} ·{" "}
                                {tCatalog(`type.${attribute.type}`)}
                                {isText ? ` · ${t("filterTextBlocked")}` : null}
                              </span>
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </SoftNavPending>
  );
}
