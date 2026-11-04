"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { MemberOrderPicker } from "@/components/admin/catalog/display-groups-panel";
import ProductDetailsTabs from "@/components/single-product/product-details-tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CascadeSelect from "@/components/form/cascade-select";
import type {
  ProductPageEditorPayload,
  ProductPageEditorTab,
} from "@/lib/admin/product-page-editor-data";
import {
  clampKeyFactsMax,
  isKeyFactEligibleAttribute,
  isTextAreaTabEligibleAttribute,
  KEY_FACTS_MAX_MAX,
  KEY_FACTS_MAX_MIN,
  PRODUCT_PAGE_TAB_KINDS,
  type ProductPageTabKindName,
} from "@/lib/catalog/product-page-layout";
import type { ProductDetailsTab } from "@/lib/catalog/product-page";
import { taxonomyToCascadeItems } from "@/lib/catalog/taxonomy";
import type { CatalogAttribute } from "@/lib/catalog/types";
import { notify } from "@/lib/ui/notify";
import { useRouter } from "@/i18n/navigation";
import { saveProductPageLayoutAction } from "@/utils/product-page-actions";
import { useTranslations } from "next-intl";
import {
  LuArrowDown,
  LuArrowUp,
  LuPencil,
  LuPlus,
  LuTrash2,
} from "react-icons/lu";

const DESCRIPTION_SOURCE = "__DESCRIPTION__";

function newTabId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `tab-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function demoValueForAttribute(attr: CatalogAttribute) {
  if (attr.type === "MULTI_SELECT") {
    return (
      attr.options
        ?.slice(0, 3)
        .map((opt) => opt.label)
        .join(", ") || "ABS, Клімат"
    );
  }
  if (attr.type === "BOOLEAN") return "Так";
  if (attr.type === "YEAR" || attr.key === "year") return "2019";
  if (attr.key === "mileage") return "540 000 км";
  if (attr.unit) return `440 ${attr.unit}`;
  return attr.name;
}

function attributesForTabKind(
  attributes: CatalogAttribute[],
  kind: ProductPageTabKindName
) {
  if (kind === "TEXT") {
    return attributes.filter((attr) =>
      isTextAreaTabEligibleAttribute({
        id: attr.id,
        key: attr.key,
        type: attr.type,
        textInput: attr.textInput,
      })
    );
  }
  if (kind === "LIST") {
    return attributes.filter(
      (attr) => attr.type === "MULTI_SELECT" || attr.type === "BOOLEAN"
    );
  }
  return attributes.filter((attr) => attr.type !== "MULTI_SELECT");
}

/** Drop TEXT LINE (and other non-AREA) sources from TEXT tabs. */
function sanitizeTabsForAreaOnly(
  tabs: ProductPageEditorTab[],
  attributes: CatalogAttribute[]
): ProductPageEditorTab[] {
  const areaIds = new Set(
    attributesForTabKind(attributes, "TEXT").map((attr) => attr.id)
  );
  return tabs.map((tab) => {
    if (tab.kind !== "TEXT") return tab;
    const slot = tab.slots.find((item) => item.visible) ?? tab.slots[0];
    if (!slot) {
      return {
        ...tab,
        slots: [
          {
            attributeId: null,
            systemSource: "DESCRIPTION" as const,
            visible: true,
          },
        ],
      };
    }
    if (slot.systemSource === "DESCRIPTION") return tab;
    if (slot.attributeId && areaIds.has(slot.attributeId)) return tab;
    return {
      ...tab,
      slots: [
        {
          attributeId: null,
          systemSource: "DESCRIPTION" as const,
          visible: true,
        },
      ],
    };
  });
}

export default function ProductPageEditor({
  tree,
  selectedNodeId,
  selectedNodeName,
  attributes,
  keyFactsMax: initialKeyFactsMax,
  keyFactSlots: initialKeyFactSlots,
  tabs: initialTabs,
}: ProductPageEditorPayload) {
  const t = useTranslations("UiEditor");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [keyFactsMax, setKeyFactsMax] = useState(
    clampKeyFactsMax(initialKeyFactsMax)
  );
  const [keyFactIds, setKeyFactIds] = useState(
    initialKeyFactSlots
      .filter((slot) => slot.visible)
      .map((slot) => slot.attributeId)
  );
  const [tabs, setTabs] = useState<ProductPageEditorTab[]>(() =>
    sanitizeTabsForAreaOnly(initialTabs, attributes)
  );
  const [activeTabId, setActiveTabId] = useState(initialTabs[0]?.id ?? "");
  const [tabDialogOpen, setTabDialogOpen] = useState(false);
  const [tabDialogMode, setTabDialogMode] = useState<"create" | "rename">(
    "create"
  );
  const [tabDialogName, setTabDialogName] = useState("");

  const hasFolder = Boolean(selectedNodeId);
  const byId = useMemo(
    () => new Map(attributes.map((attr) => [attr.id, attr])),
    [attributes]
  );

  const keyFactAttributes = useMemo(
    () =>
      attributes.filter((attr) =>
        isKeyFactEligibleAttribute({
          id: attr.id,
          key: attr.key,
          type: attr.type,
          textInput: attr.textInput,
        })
      ),
    [attributes]
  );

  useEffect(() => {
    setKeyFactsMax(clampKeyFactsMax(initialKeyFactsMax));
    setKeyFactIds(
      initialKeyFactSlots
        .filter((slot) => slot.visible)
        .map((slot) => slot.attributeId)
    );
    const nextTabs = sanitizeTabsForAreaOnly(initialTabs, attributes);
    setTabs(nextTabs);
    setActiveTabId(nextTabs[0]?.id ?? "");
  }, [
    selectedNodeId,
    initialKeyFactsMax,
    initialKeyFactSlots,
    initialTabs,
    attributes,
  ]);

  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];

  const detailsPreviewTabs = useMemo((): ProductDetailsTab[] => {
    return tabs
      .map((tab): ProductDetailsTab | null => {
        if (tab.kind === "TEXT") {
          const slot = tab.slots.find((item) => item.visible);
          if (!slot) return null;
          const body =
            slot.systemSource === "DESCRIPTION"
              ? t("productPagePreviewDescriptionBody")
              : t("productPagePreviewTextBody", {
                  field: byId.get(slot.attributeId ?? "")?.name ?? "—",
                });
          return { id: tab.id, name: tab.name, kind: "TEXT", body };
        }
        if (tab.kind === "LIST") {
          const items: string[] = [];
          for (const slot of tab.slots) {
            if (!slot.visible || !slot.attributeId) continue;
            const attr = byId.get(slot.attributeId);
            if (!attr) continue;
            if (attr.type === "MULTI_SELECT") {
              const labels =
                attr.options?.slice(0, 4).map((opt) => opt.label) ?? [];
              items.push(...(labels.length ? labels : [attr.name]));
            } else {
              items.push(attr.name);
            }
          }
          if (items.length === 0) return null;
          return { id: tab.id, name: tab.name, kind: "LIST", items };
        }
        const rows = tab.slots
          .filter((slot) => slot.visible && slot.attributeId)
          .map((slot) => {
            const attr = byId.get(slot.attributeId!);
            if (!attr) return null;
            return {
              id: attr.id,
              label: attr.name,
              value: demoValueForAttribute(attr),
            };
          })
          .filter(Boolean) as { id: string; label: string; value: string }[];
        if (rows.length === 0) return null;
        return {
          id: tab.id,
          name: tab.name,
          kind: "TABLE",
          groups: [{ id: tab.id, title: "", rows }],
        };
      })
      .filter(Boolean) as ProductDetailsTab[];
  }, [byId, t, tabs]);

  function selectFolder(id: string | null) {
    startTransition(() => {
      router.replace(
        id
          ? `/admin/ui?tab=productCard&node=${id}`
          : `/admin/ui?tab=productCard`
      );
    });
  }

  function openCreateTab() {
    setTabDialogMode("create");
    setTabDialogName("");
    setTabDialogOpen(true);
  }

  function openRenameTab() {
    if (!activeTab) return;
    setTabDialogMode("rename");
    setTabDialogName(activeTab.name);
    setTabDialogOpen(true);
  }

  function confirmTabDialog() {
    const name = tabDialogName.trim();
    if (!name) return;
    if (tabDialogMode === "create") {
      const id = newTabId();
      const next: ProductPageEditorTab = {
        id,
        name,
        kind: "TABLE",
        slots: [],
      };
      setTabs((prev) => [...prev, next]);
      setActiveTabId(id);
    } else if (activeTab) {
      setTabs((prev) =>
        prev.map((tab) =>
          tab.id === activeTab.id ? { ...tab, name } : tab
        )
      );
    }
    setTabDialogOpen(false);
  }

  function deleteActiveTab() {
    if (!activeTab) return;
    setTabs((prev) => {
      const next = prev.filter((tab) => tab.id !== activeTab.id);
      setActiveTabId(next[0]?.id ?? "");
      return next;
    });
  }

  function moveTab(direction: -1 | 1) {
    if (!activeTab) return;
    setTabs((prev) => {
      const index = prev.findIndex((tab) => tab.id === activeTab.id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const tmp = next[index];
      next[index] = next[target];
      next[target] = tmp;
      return next;
    });
  }

  function setActiveKind(kind: ProductPageTabKindName) {
    if (!activeTab) return;
    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.id !== activeTab.id) return tab;
        if (kind === "TEXT") {
          return {
            ...tab,
            kind,
            slots: [
              {
                attributeId: null,
                systemSource: "DESCRIPTION",
                visible: true,
              },
            ],
          };
        }
        return { ...tab, kind, slots: [] };
      })
    );
  }

  function setActiveAttributeIds(ids: string[]) {
    if (!activeTab) return;
    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.id !== activeTab.id) return tab;
        if (tab.kind === "TEXT") {
          const id = ids[0];
          if (!id) return { ...tab, slots: [] };
          if (id === DESCRIPTION_SOURCE) {
            return {
              ...tab,
              slots: [
                {
                  attributeId: null,
                  systemSource: "DESCRIPTION",
                  visible: true,
                },
              ],
            };
          }
          return {
            ...tab,
            slots: [
              {
                attributeId: id,
                systemSource: null,
                visible: true,
              },
            ],
          };
        }
        return {
          ...tab,
          slots: ids.map((attributeId) => ({
            attributeId,
            systemSource: null,
            visible: true,
          })),
        };
      })
    );
  }

  const activeMemberIds = useMemo(() => {
    if (!activeTab) return [] as string[];
    if (activeTab.kind === "TEXT") {
      const slot = activeTab.slots[0];
      if (!slot) return [];
      if (slot.systemSource === "DESCRIPTION") return [DESCRIPTION_SOURCE];
      return slot.attributeId ? [slot.attributeId] : [];
    }
    return activeTab.slots
      .filter((slot) => slot.visible && slot.attributeId)
      .map((slot) => slot.attributeId!);
  }, [activeTab]);

  const textSourceOptions = useMemo(
    () => [
      {
        id: DESCRIPTION_SOURCE,
        name: t("productPageSystemDescription"),
      },
      ...attributesForTabKind(attributes, "TEXT").map((attr) => ({
        id: attr.id,
        name: attr.name,
      })),
    ],
    [attributes, t]
  );

  function save() {
    if (!selectedNodeId) {
      notify.error(t("noFolder"));
      return;
    }
    startTransition(async () => {
      const result = await saveProductPageLayoutAction({
        taxonomyNodeId: selectedNodeId,
        keyFactsMax,
        keyFactSlots: keyFactIds.map((attributeId) => ({
          attributeId,
          visible: true,
        })),
        tabs: tabs.map((tab) => ({
          id: tab.id,
          name: tab.name,
          kind: tab.kind,
          slots: tab.slots,
        })),
      });
      notify.fromAction(result);
    });
  }

  return (
    <div className="grid gap-6">
      <section className="grid min-w-0 w-full gap-2">
        <Label>{t("pickFolder")}</Label>
        <p className="text-xs text-muted-foreground">{t("pickFolderHint")}</p>
        <CascadeSelect
          items={taxonomyToCascadeItems(tree)}
          value={selectedNodeId}
          onValueChange={selectFolder}
          placeholder={t("pickFolder")}
          emptyLabel={t("noFolder")}
          variant="tree"
          leafOnly
        />
      </section>

      {hasFolder ? (
        <>
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {t("productPageKeyFactsTitle")}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {t("productPageKeyFactsHint", {
                  folder: selectedNodeName ?? "—",
                })}
              </p>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid max-w-xs gap-2">
                <Label>{t("productPageKeyFactsMax")}</Label>
                <Select
                  value={String(keyFactsMax)}
                  onValueChange={(value) =>
                    setKeyFactsMax(clampKeyFactsMax(Number(value)))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(
                      { length: KEY_FACTS_MAX_MAX - KEY_FACTS_MAX_MIN + 1 },
                      (_, index) => KEY_FACTS_MAX_MIN + index
                    ).map((count) => (
                      <SelectItem key={count} value={String(count)}>
                        {count}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {keyFactAttributes.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("productPageNoSubtreeFields")}
                </p>
              ) : (
                <MemberOrderPicker
                  attributes={keyFactAttributes}
                  value={keyFactIds}
                  onChange={setKeyFactIds}
                  allowEmpty
                />
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {t("productPageDetailsTitle")}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {t("productPageDetailsHint")}
              </p>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex min-w-0 flex-1 flex-wrap gap-1">
                  {tabs.map((tab) => (
                    <Button
                      key={tab.id}
                      type="button"
                      size="sm"
                      variant={tab.id === activeTab?.id ? "default" : "outline"}
                      onClick={() => setActiveTabId(tab.id)}
                    >
                      {tab.name}
                    </Button>
                  ))}
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={openCreateTab}
                >
                  <LuPlus className="size-4" />
                  {t("productPageAddTab")}
                </Button>
              </div>

              {activeTab ? (
                <div className="grid gap-4 rounded-sm border border-border p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={openRenameTab}
                    >
                      <LuPencil className="size-4" />
                      {t("productPageRenameTab")}
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => moveTab(-1)}
                      aria-label={t("productPageMoveUp")}
                    >
                      <LuArrowUp className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => moveTab(1)}
                      aria-label={t("productPageMoveDown")}
                    >
                      <LuArrowDown className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={deleteActiveTab}
                    >
                      <LuTrash2 className="size-4" />
                      {t("productPageDeleteTab")}
                    </Button>
                  </div>

                  <div className="grid max-w-xs gap-2">
                    <Label>{t("productPageTabKind")}</Label>
                    <Select
                      value={activeTab.kind}
                      onValueChange={(value) =>
                        setActiveKind(value as ProductPageTabKindName)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRODUCT_PAGE_TAB_KINDS.map((kind) => (
                          <SelectItem key={kind} value={kind}>
                            {t(`productPageTabKind_${kind}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {activeTab.kind === "TEXT" ? (
                    <div className="grid gap-2">
                      <Label>{t("productPageTextSource")}</Label>
                      <Select
                        value={activeMemberIds[0] ?? ""}
                        onValueChange={(value) =>
                          setActiveAttributeIds(value ? [value] : [])
                        }
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("productPageTextSourcePick")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {textSourceOptions.map((opt) => (
                            <SelectItem key={opt.id} value={opt.id}>
                              {opt.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <MemberOrderPicker
                      attributes={attributesForTabKind(
                        attributes,
                        activeTab.kind
                      )}
                      value={activeMemberIds}
                      onChange={setActiveAttributeIds}
                      allowEmpty
                    />
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t("productPageNoTabs")}
                </p>
              )}

              <div className="grid gap-2">
                <p className="text-sm font-medium">
                  {t("productPagePreviewTitle")}
                </p>
                {detailsPreviewTabs.length > 0 ? (
                  <ProductDetailsTabs
                    tabs={detailsPreviewTabs}
                    textHeading={t("productPagePreviewTextHeading")}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {t("productPagePreviewEmpty")}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="button" disabled={isPending} onClick={save}>
              {t("saveProductPage")}
            </Button>
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">{t("stubProductCard")}</p>
      )}

      <Dialog open={tabDialogOpen} onOpenChange={setTabDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {tabDialogMode === "create"
                ? t("productPageAddTab")
                : t("productPageRenameTab")}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="pdp-tab-name">{t("productPageTabName")}</Label>
            <Input
              id="pdp-tab-name"
              value={tabDialogName}
              onChange={(event) => setTabDialogName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  confirmTabDialog();
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setTabDialogOpen(false)}
            >
              {t("productPageTabCancel")}
            </Button>
            <Button type="button" onClick={confirmTabDialog}>
              {t("productPageTabConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
