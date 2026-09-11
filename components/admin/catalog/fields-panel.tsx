"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ATTRIBUTE_TYPES, type CatalogAttribute } from "@/lib/catalog/types";
import type { TaxonomyNodeRow } from "@/lib/catalog/types";
import {
  createAttributeAction,
  deleteAttributeAction,
  updateAttributeAction,
} from "@/utils/taxonomy-actions";
import { LuPen, LuPlus, LuTrash2 } from "react-icons/lu";
import AdminInfoTip from "./admin-info-tip";
import CatalogForm from "./catalog-form";
import {
  CatalogField,
  CatalogFlag,
  CatalogNativeSelect,
  CatalogSubmit,
} from "./catalog-fields";
import OptionEditor from "./option-editor";

type FieldSheet =
  | { mode: "create" }
  | { mode: "edit"; attributeId: string }
  | { mode: "delete"; attributeId: string }
  | null;

function FieldRow({
  attribute,
  onEdit,
  onDelete,
}: {
  attribute: CatalogAttribute;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const t = useTranslations("CatalogAdmin");
  const meta = [
    attribute.key,
    t(`type.${attribute.type}`),
    attribute.dependsOn
      ? t("dependsOnLabel", { field: attribute.dependsOn.name })
      : null,
    attribute.inherited
      ? t("declaredOn", { folder: attribute.source.name })
      : null,
  ].filter(Boolean);

  return (
    <div className="flex items-start justify-between gap-4 rounded-sm border p-4">
      <div className="grid min-w-0 gap-2">
        <p className="font-medium">
          {attribute.name}
          {attribute.unit ? (
            <span className="text-muted-foreground">, {attribute.unit}</span>
          ) : null}
        </p>
        <p className="text-xs text-muted-foreground">{meta.join(" · ")}</p>
        <div className="flex flex-wrap gap-1.5">
          {attribute.isRequired ? (
            <Badge variant="secondary">{t("flagRequired")}</Badge>
          ) : null}
          {attribute.isFacet ? (
            <Badge variant="secondary">{t("flagFacet")}</Badge>
          ) : null}
          {attribute.isIdentity ? (
            <Badge variant="secondary">{t("flagIdentity")}</Badge>
          ) : null}
          {attribute.type === "SELECT" ? (
            <Badge variant="outline">
              {t("optionsCount", { count: attribute.options.length })}
            </Badge>
          ) : null}
        </div>
      </div>
      {onEdit && onDelete ? (
        <div className="flex shrink-0 items-center">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground"
            onClick={onEdit}
            aria-label={t("editField")}
            title={t("editField")}
          >
            <LuPen className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground"
            onClick={onDelete}
            aria-label={t("deleteField")}
            title={t("deleteField")}
          >
            <LuTrash2 className="size-4" />
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export default function FieldsPanel({
  node,
  attributes,
}: {
  node: TaxonomyNodeRow | null;
  attributes: CatalogAttribute[];
}) {
  const t = useTranslations("CatalogAdmin");
  const [sheet, setSheet] = useState<FieldSheet>(null);

  if (!node) {
    return (
      <p className="text-sm text-muted-foreground">{t("pickFolderLede")}</p>
    );
  }

  const own = attributes.filter((item) => !item.inherited);
  const inherited = attributes.filter((item) => item.inherited);
  const selectFields = attributes.filter((item) => item.type === "SELECT");
  const active =
    sheet && sheet.mode !== "create"
      ? attributes.find((item) => item.id === sheet.attributeId) ?? null
      : null;
  const parentOptions = active?.dependsOnAttributeId
    ? attributes.find((item) => item.id === active.dependsOnAttributeId)?.options ??
      []
    : [];

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => setSheet({ mode: "create" })}
          >
            <LuPlus className="size-4" />
            {t("addField")}
          </Button>
          <AdminInfoTip label={t("helpLabel")}>
            <p>{t("fieldsHelp.p1")}</p>
            <p>{t("fieldsHelp.p2")}</p>
            <p>{t("fieldsHelp.p3")}</p>
          </AdminInfoTip>
        </CardHeader>
        <CardContent className="grid gap-6">

          <div className="grid gap-3">
            <p className="text-sm font-medium">{t("ownFields")}</p>
            {own.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("noOwnFields")}</p>
            ) : (
              own.map((attribute) => (
                <FieldRow
                  key={attribute.id}
                  attribute={attribute}
                  onEdit={() =>
                    setSheet({ mode: "edit", attributeId: attribute.id })
                  }
                  onDelete={() =>
                    setSheet({ mode: "delete", attributeId: attribute.id })
                  }
                />
              ))
            )}
          </div>

          {inherited.length > 0 ? (
            <div className="grid gap-3">
              <Separator />
              <div className="grid gap-1">
                <p className="text-sm font-medium">{t("inheritedFields")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("inheritedHint")}
                </p>
              </div>
              {inherited.map((attribute) => (
                <FieldRow key={attribute.id} attribute={attribute} />
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Sheet
        open={sheet !== null}
        onOpenChange={(open) => {
          if (!open) setSheet(null);
        }}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {sheet?.mode === "create" ? (
            <div className="grid gap-6">
              <SheetHeader>
                <SheetTitle>{t("newField")}</SheetTitle>
                <SheetDescription>
                  {t("newFieldHint", { folder: node.name })}
                </SheetDescription>
              </SheetHeader>
              <CatalogForm
                className="grid gap-4"
                action={createAttributeAction}
                onSuccess={() => setSheet(null)}
              >
                <input type="hidden" name="taxonomyNodeId" value={node.id} />
                <CatalogField name="name" label={t("fieldName")} />
                <CatalogNativeSelect
                  name="type"
                  label={t("fieldType")}
                  defaultValue="SELECT"
                >
                  {ATTRIBUTE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {t(`type.${type}`)}
                    </option>
                  ))}
                </CatalogNativeSelect>
                <CatalogNativeSelect
                  name="dependsOnAttributeId"
                  label={t("dependsOn")}
                >
                  <option value="">{t("dependsOnNone")}</option>
                  {selectFields.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.inherited
                        ? `${item.name} (${item.source.name})`
                        : item.name}
                    </option>
                  ))}
                </CatalogNativeSelect>
                <CatalogField
                  name="unit"
                  label={t("unit")}
                  required={false}
                />
                <div className="flex flex-wrap gap-4">
                  <CatalogFlag name="isRequired" label={t("flagRequired")} />
                  <CatalogFlag
                    name="isFacet"
                    label={t("flagFacet")}
                    defaultChecked
                  />
                  <CatalogFlag name="isIdentity" label={t("flagIdentity")} />
                </div>
                <CatalogSubmit text={t("addField")} className="w-fit" />
              </CatalogForm>
            </div>
          ) : null}

          {sheet?.mode === "edit" && active ? (
            <div className="grid gap-6">
              <SheetHeader>
                <SheetTitle>{active.name}</SheetTitle>
                <SheetDescription>
                  {active.key} · {t(`type.${active.type}`)}
                  {active.dependsOn
                    ? ` · ${t("dependsOnLabel", { field: active.dependsOn.name })}`
                    : ""}
                </SheetDescription>
              </SheetHeader>
              <CatalogForm
                className="grid gap-4"
                action={updateAttributeAction}
              >
                <input type="hidden" name="attributeId" value={active.id} />
                <CatalogField
                  name="name"
                  label={t("fieldName")}
                  defaultValue={active.name}
                />
                <CatalogField
                  name="unit"
                  label={t("unit")}
                  defaultValue={active.unit ?? ""}
                  required={false}
                />
                <div className="flex flex-wrap gap-4">
                  <CatalogFlag
                    name="isRequired"
                    label={t("flagRequired")}
                    defaultChecked={active.isRequired}
                  />
                  <CatalogFlag
                    name="isFacet"
                    label={t("flagFacet")}
                    defaultChecked={active.isFacet}
                  />
                  <CatalogFlag
                    name="isIdentity"
                    label={t("flagIdentity")}
                    defaultChecked={active.isIdentity}
                  />
                </div>
                <CatalogSubmit text={t("saveField")} className="w-fit" />
              </CatalogForm>
              {active.type === "SELECT" ? (
                <>
                  <Separator />
                  <OptionEditor
                    attribute={active}
                    parentOptions={parentOptions}
                  />
                </>
              ) : null}
            </div>
          ) : null}

          {sheet?.mode === "delete" && active ? (
            <div className="grid gap-6">
              <SheetHeader>
                <SheetTitle>{t("deleteFieldTitle")}</SheetTitle>
                <SheetDescription>
                  {t("deleteFieldSubject", { field: active.name })}
                </SheetDescription>
              </SheetHeader>
              <p className="text-sm text-muted-foreground">
                {t("deleteFieldHint")}
              </p>
              <CatalogForm
                className="flex items-center gap-3"
                action={deleteAttributeAction}
                onSuccess={() => setSheet(null)}
              >
                <input type="hidden" name="attributeId" value={active.id} />
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
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
