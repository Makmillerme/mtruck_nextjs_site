"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { MemberOrderPicker } from "@/components/admin/catalog/display-groups-panel";
import ProductNameTags from "@/components/admin/products/product-name-tags";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  CatalogAttribute,
  CatalogDisplayGroup,
} from "@/lib/catalog/types";
import { notify } from "@/lib/ui/notify";
import {
  initialTaxonomyActionState,
} from "@/utils/taxonomy-action-state";
import { saveProductNameTemplateAction } from "@/utils/taxonomy-actions";
import { LuSettings } from "react-icons/lu";

export default function ProductNameSettingsDialog({
  folderNodeId,
  attributes,
  writerGroup,
  onSaved,
}: {
  folderNodeId?: string;
  attributes: CatalogAttribute[];
  writerGroup: CatalogDisplayGroup | null;
  onSaved: () => void;
}) {
  const t = useTranslations("CatalogAdmin");
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [memberIds, setMemberIds] = useState<string[]>(
    writerGroup?.members.map((member) => member.attributeId) ?? []
  );
  const [separator, setSeparator] = useState(writerGroup?.separator ?? " ");

  useEffect(() => {
    if (!open) return;
    setMemberIds(
      writerGroup?.members.map((member) => member.attributeId) ?? []
    );
    setSeparator(writerGroup?.separator ?? " ");
  }, [open, writerGroup]);

  const byId = useMemo(
    () => new Map(attributes.map((item) => [item.id, item])),
    [attributes]
  );

  const previewTags = useMemo(
    () =>
      memberIds
        .map((id) => {
          const attribute = byId.get(id);
          const label =
            attribute?.name ??
            writerGroup?.members.find((m) => m.attributeId === id)?.attribute
              .name ??
            id;
          return { id, label, filled: true as const };
        })
        .filter(Boolean),
    [memberIds, byId, writerGroup]
  );

  const disabled = !folderNodeId;

  function save() {
    if (!folderNodeId) {
      notify.error(t("productNameSettingsNeedFolder"));
      return;
    }
    const formData = new FormData();
    formData.set("taxonomyNodeId", folderNodeId);
    formData.set("separator", separator);
    for (const id of memberIds) {
      formData.append("memberAttributeId", id);
    }
    startTransition(async () => {
      const result = await saveProductNameTemplateAction(
        initialTaxonomyActionState,
        formData
      );
      notify.fromAction(result);
      if (result.ok) {
        setOpen(false);
        onSaved();
      }
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        aria-label={t("productNameSettings")}
        title={
          disabled
            ? t("productNameSettingsNeedFolder")
            : t("productNameSettings")
        }
        size="icon"
        className="size-11 shrink-0"
        onClick={() => {
          if (!folderNodeId) return;
          setOpen(true);
        }}
      >
        <LuSettings className="size-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("productNameSettings")}</DialogTitle>
          </DialogHeader>
          {folderNodeId ? (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <p className="text-sm font-medium">
                  {t("productNameTemplatePreview")}
                </p>
                <ProductNameTags
                  items={previewTags}
                  separator={separator}
                  emptyLabel={t("productNameTemplatePreviewEmpty")}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="product-name-separator">
                  {t("displayGroupSeparator")}
                </Label>
                <Input
                  id="product-name-separator"
                  value={separator}
                  onChange={(event) => setSeparator(event.target.value)}
                />
              </div>
              {writerGroup?.inherited ? (
                <p className="text-sm text-muted-foreground">
                  {t("productNameSettingsInherited")}
                </p>
              ) : null}
              <MemberOrderPicker
                attributes={attributes}
                value={memberIds}
                onChange={setMemberIds}
                allowEmpty
              />
              <DialogFooter>
                <Button
                  type="button"
                  className="w-fit"
                  disabled={isPending}
                  onClick={save}
                >
                  {t("productNameTemplateSave")}
                </Button>
              </DialogFooter>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
