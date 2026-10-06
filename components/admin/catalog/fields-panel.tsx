"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  ATTRIBUTE_TYPES,
  SHEET_WIDTHS,
  type CatalogAttribute,
  type CatalogDisplayGroup,
  type TaxonomyNodeRow,
} from "@/lib/catalog/types";
import { ConfirmDeleteIcon } from "@/components/form/ConfirmDelete";
import {
  createAttributeAction,
  deleteAttributeAction,
  updateAttributeAction,
} from "@/utils/taxonomy-actions";
import type { actionFunction } from "@/utils/types";
import { LuPen } from "react-icons/lu";
import AdminInfoTip from "./admin-info-tip";
import CatalogForm from "./catalog-form";
import CmsPanelToolbar from "./cms-panel-toolbar";
import {
  CatalogField,
  CatalogFlag,
  CatalogMenuSelect,
  CatalogSubmit,
} from "./catalog-fields";
import DisplayGroupsPanel from "./display-groups-panel";
import OptionEditor from "./option-editor";

type FieldSheet =
  | { mode: "create" }
  | { mode: "edit"; attributeId: string }
  | null;

function FieldFlags({
  defaults,
}: {
  defaults?: {
    isRequired?: boolean;
    isFacet?: boolean;
  };
}) {
  const t = useTranslations("CatalogAdmin");
  return (
    <div className="grid gap-2">
      <CatalogFlag
        name="isRequired"
        label={t("flagRequired")}
        defaultChecked={defaults?.isRequired}
        hintLabel={t("helpLabel")}
        hint={<p>{t("flagRequiredHint")}</p>}
      />
      <CatalogFlag
        name="isFacet"
        label={t("flagFacet")}
        defaultChecked={defaults?.isFacet ?? true}
        hintLabel={t("helpLabel")}
        hint={<p>{t("flagFacetHint")}</p>}
      />
    </div>
  );
}

function FieldRow({
  attribute,
  onEdit,
}: {
  attribute: CatalogAttribute;
  onEdit?: () => void;
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
          <Badge variant="outline">
            {t(`sheetWidth.${attribute.sheetWidth}`)}
          </Badge>
          {attribute.type === "SELECT" ? (
            <Badge variant="outline">
              {t("optionsCount", { count: attribute.options.length })}
            </Badge>
          ) : null}
        </div>
      </div>
      {onEdit ? (
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
          <ConfirmDeleteIcon
            action={deleteAttributeAction as unknown as actionFunction}
            title={t("deleteFieldTitle")}
            description={`${t("deleteFieldSubject", { field: attribute.name })} ${t("deleteFieldHint")}`}
          >
            <input type="hidden" name="attributeId" value={attribute.id} />
          </ConfirmDeleteIcon>
        </div>
      ) : null}
    </div>
  );
}

export default function FieldsPanel({
  node,
  attributes,
  displayGroups,
}: {
  node: TaxonomyNodeRow | null;
  attributes: CatalogAttribute[];
  displayGroups: CatalogDisplayGroup[];
}) {
  const t = useTranslations("CatalogAdmin");
  const [sheet, setSheet] = useState<FieldSheet>(null);
  const [query, setQuery] = useState("");

  const searching = query.trim().length > 0;
  const queryLower = query.trim().toLowerCase();

  const own = useMemo(
    () => attributes.filter((item) => !item.inherited),
    [attributes]
  );
  const inherited = useMemo(
    () => attributes.filter((item) => item.inherited),
    [attributes]
  );
  const filteredOwn = useMemo(
    () =>
      searching
        ? own.filter((item) => item.name.toLowerCase().includes(queryLower))
        : own,
    [own, searching, queryLower]
  );
  const filteredInherited = useMemo(
    () =>
      searching
        ? inherited.filter((item) =>
            item.name.toLowerCase().includes(queryLower)
          )
        : inherited,
    [inherited, searching, queryLower]
  );

  if (!node) {
    return (
      <p className="text-sm text-muted-foreground">{t("pickFolderLede")}</p>
    );
  }

  const selectFields = attributes.filter((item) => item.type === "SELECT");
  const active =
    sheet && sheet.mode !== "create"
      ? attributes.find((item) => item.id === sheet.attributeId) ?? null
      : null;
  const parentOptions = active?.dependsOnAttributeId
    ? attributes.find((item) => item.id === active.dependsOnAttributeId)
        ?.options ?? []
    : [];

  const searchEmpty =
    searching &&
    filteredOwn.length === 0 &&
    filteredInherited.length === 0;

  return (
    <>
      <Card className="shadow-sm">
        <CardContent className="grid gap-6 pt-6">
          <CmsPanelToolbar
            search={query}
            onSearchChange={setQuery}
            searchPlaceholder={t("fieldSearchPlaceholder")}
            createLabel={t("addField")}
            onCreate={() => setSheet({ mode: "create" })}
            infoTip={
              <AdminInfoTip label={t("helpLabel")}>
                <p>{t("fieldsHelp.p1")}</p>
                <p>{t("fieldsHelp.p2")}</p>
                <p>{t("fieldsHelp.p3")}</p>
              </AdminInfoTip>
            }
          />

          {searchEmpty ? (
            <p className="text-sm text-muted-foreground">
              {t("panelSearchEmpty")}
            </p>
          ) : (
            <>
              <div className="grid gap-3">
                <p className="text-sm font-medium">{t("ownFields")}</p>
                {filteredOwn.length === 0 ? (
                  !searching ? (
                    <p className="text-sm text-muted-foreground">
                      {t("noOwnFields")}
                    </p>
                  ) : null
                ) : (
                  filteredOwn.map((attribute) => (
                    <FieldRow
                      key={attribute.id}
                      attribute={attribute}
                      onEdit={() =>
                        setSheet({ mode: "edit", attributeId: attribute.id })
                      }
                    />
                  ))
                )}
              </div>

              {filteredInherited.length > 0 ? (
                <div className="grid gap-3">
                  <Separator />
                  <div className="grid gap-1">
                    <p className="text-sm font-medium">{t("inheritedFields")}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("inheritedHint")}
                    </p>
                  </div>
                  {filteredInherited.map((attribute) => (
                    <FieldRow key={attribute.id} attribute={attribute} />
                  ))}
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

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
                <CatalogMenuSelect
                  name="type"
                  label={t("fieldType")}
                  searchable={false}
                  defaultValue="SELECT"
                  options={ATTRIBUTE_TYPES.map((type) => ({
                    value: type,
                    label: t(`type.${type}`),
                  }))}
                />
                <CatalogMenuSelect
                  name="dependsOnAttributeId"
                  label={t("dependsOn")}
                  defaultValue=""
                  allowClear
                  clearLabel={t("dependsOnNone")}
                  options={selectFields.map((item) => ({
                    value: item.id,
                    label: item.inherited
                      ? `${item.name} (${item.source.name})`
                      : item.name,
                  }))}
                />
                <CatalogField
                  name="unit"
                  label={t("unit")}
                  required={false}
                />
                <CatalogMenuSelect
                  name="sheetWidth"
                  label={t("sheetWidthLabel")}
                  searchable={false}
                  defaultValue="FULL"
                  options={SHEET_WIDTHS.map((width) => ({
                    value: width,
                    label: t(`sheetWidth.${width}`),
                  }))}
                />
                <FieldFlags />
                <CatalogSubmit text={t("addField")} className="w-fit" />
              </CatalogForm>
            </div>
          ) : null}

          {sheet?.mode === "edit" && active ? (
            <div className="grid gap-6">
              <SheetHeader>
                <SheetTitle>{active.name}</SheetTitle>
                <SheetDescription>{active.key}</SheetDescription>
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
                <CatalogMenuSelect
                  name="type"
                  label={t("fieldType")}
                  searchable={false}
                  defaultValue={active.type}
                  options={ATTRIBUTE_TYPES.map((type) => ({
                    value: type,
                    label: t(`type.${type}`),
                  }))}
                />
                <CatalogMenuSelect
                  name="dependsOnAttributeId"
                  label={t("dependsOn")}
                  defaultValue={active.dependsOnAttributeId ?? ""}
                  allowClear
                  clearLabel={t("dependsOnNone")}
                  options={selectFields
                    .filter((item) => item.id !== active.id)
                    .map((item) => ({
                      value: item.id,
                      label: item.inherited
                        ? `${item.name} (${item.source.name})`
                        : item.name,
                    }))}
                />
                <CatalogField
                  name="unit"
                  label={t("unit")}
                  defaultValue={active.unit ?? ""}
                  required={false}
                />
                <CatalogMenuSelect
                  name="sheetWidth"
                  label={t("sheetWidthLabel")}
                  searchable={false}
                  defaultValue={active.sheetWidth}
                  options={SHEET_WIDTHS.map((width) => ({
                    value: width,
                    label: t(`sheetWidth.${width}`),
                  }))}
                />
                <FieldFlags
                  defaults={{
                    isRequired: active.isRequired,
                    isFacet: active.isFacet,
                  }}
                />
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
        </SheetContent>
      </Sheet>

      <DisplayGroupsPanel
        node={node}
        attributes={attributes}
        groups={displayGroups}
      />
    </>
  );
}
