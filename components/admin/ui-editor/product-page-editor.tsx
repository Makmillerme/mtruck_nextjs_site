"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import ProductSpecs from "@/components/single-product/product-specs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import CascadeSelect from "@/components/form/cascade-select";
import type { ProductPageEditorPayload } from "@/lib/admin/product-page-editor-data";
import { taxonomyToCascadeItems } from "@/lib/catalog/taxonomy";
import { notify } from "@/lib/ui/notify";
import { useRouter } from "@/i18n/navigation";
import { saveProductPageLayoutAction } from "@/utils/product-page-actions";
import { useTranslations } from "next-intl";
import { LuArrowDown, LuArrowUp } from "react-icons/lu";

type SlotState = { attributeId: string; visible: boolean };

export default function ProductPageEditor({
  tree,
  selectedNodeId,
  selectedNodeName,
  attributes,
  slots: initialSlots,
  inheritedFromAncestor,
}: ProductPageEditorPayload) {
  const t = useTranslations("UiEditor");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [slots, setSlots] = useState<SlotState[]>(initialSlots);

  const hasFolder = Boolean(selectedNodeId);
  const byId = useMemo(
    () => new Map(attributes.map((attr) => [attr.id, attr])),
    [attributes]
  );

  useEffect(() => {
    setSlots(initialSlots);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNodeId]);

  const previewGroups = useMemo(() => {
    const rows = slots
      .filter((slot) => slot.visible)
      .map((slot) => {
        const attr = byId.get(slot.attributeId);
        if (!attr) return null;
        return {
          id: attr.id,
          label: attr.name,
          value:
            attr.key === "mileage"
              ? "540 000 км"
              : attr.key === "year"
                ? "2019"
                : attr.name,
        };
      })
      .filter(Boolean) as { id: string; label: string; value: string }[];

    return rows.length > 0 ? [{ id: "all", title: "", rows }] : [];
  }, [byId, slots]);

  function selectFolder(id: string | null) {
    startTransition(() => {
      router.replace(
        id
          ? `/admin/ui?tab=productCard&node=${id}`
          : `/admin/ui?tab=productCard`
      );
    });
  }

  function move(index: number, direction: -1 | 1) {
    setSlots((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      const tmp = next[index];
      next[index] = next[target];
      next[target] = tmp;
      return next;
    });
  }

  function setVisible(attributeId: string, visible: boolean) {
    setSlots((prev) =>
      prev.map((slot) =>
        slot.attributeId === attributeId ? { ...slot, visible } : slot
      )
    );
  }

  function save() {
    if (!selectedNodeId) {
      notify.error(t("noFolder"));
      return;
    }
    startTransition(async () => {
      const result = await saveProductPageLayoutAction({
        taxonomyNodeId: selectedNodeId,
        slots,
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
        />
        {hasFolder && inheritedFromAncestor ? (
          <p className="text-xs text-muted-foreground">
            {t("productPageInheritedHint")}
          </p>
        ) : null}
      </section>

      {hasFolder ? (
        <>
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {t("productPageFieldsTitle")}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {t("productPageFieldsHint", {
                  folder: selectedNodeName ?? "—",
                })}
              </p>
            </CardHeader>
            <CardContent className="grid gap-2">
              {slots.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("productPageNoFields")}
                </p>
              ) : (
                slots.map((slot, index) => {
                  const attribute = byId.get(slot.attributeId);
                  if (!attribute) return null;
                  return (
                    <div
                      key={slot.attributeId}
                      className="flex items-center justify-between gap-2 rounded-sm border px-3 py-2"
                    >
                      <span className="min-w-0 truncate text-sm">
                        {attribute.name}
                        {attribute.inherited ? (
                          <span className="text-muted-foreground">
                            {" "}
                            ({attribute.source.name})
                          </span>
                        ) : null}
                      </span>
                      <div className="flex shrink-0 items-center gap-1">
                        <Switch
                          checked={slot.visible}
                          onCheckedChange={(checked) =>
                            setVisible(slot.attributeId, checked)
                          }
                          aria-label={t("productPageToggleVisible", {
                            field: attribute.name,
                          })}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground"
                          onClick={() => move(index, -1)}
                          disabled={index === 0}
                          aria-label={t("productPageMoveUp")}
                        >
                          <LuArrowUp className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground"
                          onClick={() => move(index, 1)}
                          disabled={index === slots.length - 1}
                          aria-label={t("productPageMoveDown")}
                        >
                          <LuArrowDown className="size-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {t("productPagePreviewTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {previewGroups.length > 0 ? (
                <ProductSpecs
                  groups={previewGroups}
                  title={t("productPagePreviewHeading")}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t("productPagePreviewEmpty")}
                </p>
              )}
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
    </div>
  );
}
