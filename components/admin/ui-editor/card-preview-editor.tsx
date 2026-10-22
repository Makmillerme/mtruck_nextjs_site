"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { MemberOrderPicker } from "@/components/admin/catalog/display-groups-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import VehicleCard, {
  type VehicleCardModel,
} from "@/components/vehicles/vehicle-card";
import CascadeSelect from "@/components/form/cascade-select";
import type { CardPreviewEditorPayload } from "@/lib/admin/card-preview-editor-data";
import {
  CARD_PREVIEW_CATEGORY_SOURCES,
  CARD_PREVIEW_GRID_COUNTS,
  CARD_PREVIEW_SLOT_MAX,
  CARD_PREVIEW_SPECS_STYLES,
  CARD_PREVIEW_SUBTITLE_FIELD_MAX,
  clampSpecsGridCount,
  isTagsSpecsStyle,
  slotMaxForSpecsStyle,
  type CardPreviewCategorySourceId,
  type CardPreviewSpecsStyleId,
} from "@/lib/catalog/card-preview";
import { taxonomyToCascadeItems } from "@/lib/catalog/taxonomy";
import { notify } from "@/lib/ui/notify";
import { cn } from "@/lib/utils";
import { useRouter } from "@/i18n/navigation";
import { saveCardPreviewLayoutAction } from "@/utils/card-preview-actions";
import { useTranslations } from "next-intl";
import { LuEye } from "react-icons/lu";

export default function CardPreviewEditor({
  tree,
  selectedNodeId,
  selectedNodeName,
  attributes,
  showName: initialShowName,
  showPrice: initialShowPrice,
  showStatus: initialShowStatus,
  showSubtitle: initialShowSubtitle,
  showSpecs: initialShowSpecs,
  specsStyle: initialSpecsStyle,
  specsGridCount: initialSpecsGridCount,
  categorySource: initialCategorySource,
  slotAttributeIds: initialSlots,
  subtitleAttributeIds: initialSubtitleSlots,
}: CardPreviewEditorPayload) {
  const t = useTranslations("UiEditor");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLayout, setPreviewLayout] = useState<"grid" | "list">("grid");
  const [showName, setShowName] = useState(initialShowName);
  const [showPrice, setShowPrice] = useState(initialShowPrice);
  const [showStatus, setShowStatus] = useState(initialShowStatus);
  const [showSubtitle, setShowSubtitle] = useState(initialShowSubtitle);
  const [showSpecs, setShowSpecs] = useState(initialShowSpecs);
  const [specsStyle, setSpecsStyle] =
    useState<CardPreviewSpecsStyleId>(initialSpecsStyle);
  const [specsGridCount, setSpecsGridCount] = useState(
    clampSpecsGridCount(initialSpecsGridCount)
  );
  const [categorySource, setCategorySource] =
    useState<CardPreviewCategorySourceId>(initialCategorySource);
  const [slotAttributeIds, setSlotAttributeIds] = useState(initialSlots);
  const [subtitleAttributeIds, setSubtitleAttributeIds] =
    useState(initialSubtitleSlots);

  const slotMax = slotMaxForSpecsStyle(specsStyle, specsGridCount);
  const tagsUnlimited = isTagsSpecsStyle(specsStyle);
  const hasFolder = Boolean(selectedNodeId);

  useEffect(() => {
    setShowName(initialShowName);
    setShowPrice(initialShowPrice);
    setShowStatus(initialShowStatus);
    setShowSubtitle(initialShowSubtitle);
    setShowSpecs(initialShowSpecs);
    setSpecsStyle(initialSpecsStyle);
    setSpecsGridCount(clampSpecsGridCount(initialSpecsGridCount));
    setCategorySource(initialCategorySource);
    setSlotAttributeIds(initialSlots);
    setSubtitleAttributeIds(initialSubtitleSlots);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNodeId]);

  const byId = useMemo(
    () => new Map(attributes.map((attr) => [attr.id, attr])),
    [attributes]
  );

  const previewVehicle = useMemo((): VehicleCardModel => {
    const specItems = showSpecs
      ? slotAttributeIds
          .slice(0, slotMax)
          .map((id) => byId.get(id))
          .filter(Boolean)
          .map((attr) => ({
            key: attr!.key,
            label: attr!.name,
            value:
              attr!.key === "mileage"
                ? "540 000 км"
                : attr!.key === "year"
                  ? "2019"
                  : attr!.name,
          }))
      : [];

    const categoryLabel =
      categorySource === "LAYOUT_FOLDER"
        ? selectedNodeName ?? "—"
        : t("previewDemoProductFolder");

    const fieldParts = subtitleAttributeIds
      .slice(0, CARD_PREVIEW_SUBTITLE_FIELD_MAX)
      .map((id) => byId.get(id))
      .filter(Boolean)
      .map((attr) => (attr!.key === "year" ? "2019" : attr!.name));

    return {
      id: "preview-demo",
      name: t("previewDemoName"),
      price: 68500,
      image: "/images/hero.webp",
      images: ["/images/hero.webp"],
      href: "/products",
      status: "PUBLISHED",
      categoryLabel,
      subtitleParts: [categoryLabel, ...fieldParts],
      specItems,
      specsStyle,
      specsGridCount,
      showName,
      showPrice,
      showStatus,
      showSubtitle,
      showSpecs,
    };
  }, [
    byId,
    categorySource,
    selectedNodeName,
    showName,
    showPrice,
    showStatus,
    showSubtitle,
    showSpecs,
    specsStyle,
    specsGridCount,
    slotAttributeIds,
    subtitleAttributeIds,
    slotMax,
    t,
  ]);

  function selectFolder(id: string | null) {
    startTransition(() => {
      router.replace(
        id
          ? `/admin/ui?tab=cardPreview&node=${id}`
          : `/admin/ui?tab=cardPreview`
      );
    });
  }

  function onSpecsStyleChange(next: CardPreviewSpecsStyleId) {
    setSpecsStyle(next);
  }

  function onSpecsGridCountChange(next: number) {
    setSpecsGridCount(clampSpecsGridCount(next));
  }

  function onSlotsChange(next: string[]) {
    if (next.length > CARD_PREVIEW_SLOT_MAX) {
      notify.error(t("specSlotsMax", { count: CARD_PREVIEW_SLOT_MAX }));
      setSlotAttributeIds(next.slice(0, CARD_PREVIEW_SLOT_MAX));
      return;
    }
    setSlotAttributeIds(next);
  }

  function onSubtitleSlotsChange(next: string[]) {
    if (next.length > CARD_PREVIEW_SUBTITLE_FIELD_MAX) {
      notify.error(
        t("subtitleSlotsMax", { count: CARD_PREVIEW_SUBTITLE_FIELD_MAX })
      );
      setSubtitleAttributeIds(next.slice(0, CARD_PREVIEW_SUBTITLE_FIELD_MAX));
      return;
    }
    setSubtitleAttributeIds(next);
  }

  function save() {
    if (!selectedNodeId) {
      notify.error(t("noFolder"));
      return;
    }
    startTransition(async () => {
      const result = await saveCardPreviewLayoutAction({
        taxonomyNodeId: selectedNodeId,
        showName,
        showPrice,
        showStatus,
        showSubtitle,
        showSpecs,
        specsStyle,
        specsGridCount,
        categorySource,
        slotAttributeIds: slotAttributeIds.slice(0, CARD_PREVIEW_SLOT_MAX),
        subtitleAttributeIds: subtitleAttributeIds.slice(
          0,
          CARD_PREVIEW_SUBTITLE_FIELD_MAX
        ),
      });
      notify.fromAction(result);
    });
  }

  const layoutToggle = (
    <div className="inline-flex h-11 w-full max-w-xs items-center gap-1 rounded-sm border-2 border-primary bg-background p-1 sm:w-fit">
      <button
        type="button"
        className={cn(
          "h-9 min-w-0 flex-1 rounded-sm px-4 text-sm font-semibold sm:flex-none",
          previewLayout === "grid"
            ? "bg-primary text-primary-foreground"
            : "text-primary"
        )}
        onClick={() => setPreviewLayout("grid")}
      >
        {t("previewGrid")}
      </button>
      <button
        type="button"
        className={cn(
          "h-9 min-w-0 flex-1 rounded-sm px-4 text-sm font-semibold sm:flex-none",
          previewLayout === "list"
            ? "bg-primary text-primary-foreground"
            : "text-primary"
        )}
        onClick={() => setPreviewLayout("list")}
      >
        {t("previewList")}
      </button>
    </div>
  );

  return (
    <div className="grid gap-6">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid min-w-0 w-full flex-1 gap-2">
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
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full shrink-0 sm:w-fit"
          disabled={!hasFolder}
          onClick={() => setPreviewOpen(true)}
        >
          <LuEye className="size-4" />
          {t("openPreview")}
        </Button>
      </section>

      {hasFolder ? (
        <>
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t("visibilityTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["showName", showName, setShowName, t("showName")],
                  ["showPrice", showPrice, setShowPrice, t("showPrice")],
                  ["showStatus", showStatus, setShowStatus, t("showStatus")],
                  [
                    "showSubtitle",
                    showSubtitle,
                    setShowSubtitle,
                    t("showSubtitle"),
                  ],
                  ["showSpecs", showSpecs, setShowSpecs, t("showSpecs")],
                ] as const
              ).map(([id, checked, setChecked, label]) => (
                <div
                  key={id}
                  className="flex items-center justify-between gap-3"
                >
                  <Label htmlFor={id}>{label}</Label>
                  <Switch
                    id={id}
                    checked={checked}
                    onCheckedChange={setChecked}
                  />
                </div>
              ))}

            </CardContent>
          </Card>

          {showSubtitle ? (
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {t("subtitleSectionTitle")}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t("subtitleSlotsHint", {
                    count: CARD_PREVIEW_SUBTITLE_FIELD_MAX,
                  })}
                </p>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label>{t("categorySource")}</Label>
                  <div className="inline-flex h-10 w-full max-w-md items-center gap-1 rounded-sm border border-border bg-background p-1">
                    {CARD_PREVIEW_CATEGORY_SOURCES.map((source) => (
                      <button
                        key={source}
                        type="button"
                        className={cn(
                          "h-8 min-w-0 flex-1 rounded-sm px-2 text-xs font-semibold",
                          categorySource === source
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground"
                        )}
                        onClick={() => setCategorySource(source)}
                      >
                        {source === "LAYOUT_FOLDER"
                          ? t("categorySourceLayout")
                          : t("categorySourceProduct")}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>{t("subtitleSlots")}</Label>
                  <MemberOrderPicker
                    attributes={attributes}
                    value={subtitleAttributeIds}
                    onChange={onSubtitleSlotsChange}
                    allowEmpty
                  />
                </div>
              </CardContent>
            </Card>
          ) : null}

          {showSpecs ? (
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {t("specsSectionTitle")}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {tagsUnlimited
                    ? t("specSlotsHintUnlimited")
                    : slotAttributeIds.length > slotMax
                      ? t("specSlotsHintVisible", {
                          visible: slotMax,
                          total: slotAttributeIds.length,
                        })
                      : t("specSlotsHint", { count: slotMax })}
                </p>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>{t("specsStyle")}</Label>
                    <div className="inline-flex h-10 w-full items-center gap-1 rounded-sm border border-border bg-background p-1">
                      {CARD_PREVIEW_SPECS_STYLES.map((style) => (
                        <button
                          key={style}
                          type="button"
                          className={cn(
                            "h-8 min-w-0 flex-1 rounded-sm px-2 text-xs font-semibold",
                            specsStyle === style
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground"
                          )}
                          onClick={() => onSpecsStyleChange(style)}
                        >
                          {style === "GRID"
                            ? t("specsStyleGrid")
                            : t("specsStyleTags")}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("specsStyleHint")}
                    </p>
                  </div>

                  {specsStyle === "GRID" ? (
                    <div className="grid gap-2">
                      <Label htmlFor="specsGridCount">
                        {t("specsGridCount")}
                      </Label>
                      <Select
                        value={String(specsGridCount)}
                        onValueChange={(value) =>
                          onSpecsGridCountChange(Number(value))
                        }
                      >
                        <SelectTrigger id="specsGridCount" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CARD_PREVIEW_GRID_COUNTS.map((count) => (
                            <SelectItem key={count} value={String(count)}>
                              {t("specsGridCountOption", { count })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : null}
                </div>

                <div className="grid gap-2">
                  <Label>{t("specSlots")}</Label>
                  <MemberOrderPicker
                    attributes={attributes}
                    value={slotAttributeIds}
                    onChange={onSlotsChange}
                    allowEmpty
                  />
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Button
            type="button"
            className="w-full sm:w-fit"
            disabled={isPending}
            onClick={save}
          >
            {t("saveLayout")}
          </Button>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">{t("noFolderEmptyTree")}</p>
      )}

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent
          className={cn(
            "max-h-[90vh] overflow-y-auto",
            previewLayout === "grid" ? "sm:max-w-md" : "sm:max-w-5xl"
          )}
        >
          <DialogHeader className="gap-3 sm:pr-8">
            <DialogTitle>{t("previewDialogTitle")}</DialogTitle>
            {layoutToggle}
          </DialogHeader>
          <div
            className={cn(
              "w-full min-w-0",
              previewLayout === "grid" ? "max-w-sm" : "max-w-5xl"
            )}
          >
            <VehicleCard
              vehicle={previewVehicle}
              layout={previewLayout}
              isAuthenticated={false}
              showFavorite={false}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
