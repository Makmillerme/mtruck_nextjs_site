"use client";

import { useMemo, useState } from "react";
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
import type {
  CatalogAttribute,
  CatalogDisplayGroup,
  TaxonomyNodeRow,
} from "@/lib/catalog/types";
import {
  createDisplayGroupAction,
  deleteDisplayGroupAction,
  updateDisplayGroupAction,
} from "@/utils/taxonomy-actions";
import { LuArrowDown, LuArrowUp, LuPen, LuPlus, LuX } from "react-icons/lu";
import { ConfirmDeleteIcon } from "@/components/form/ConfirmDelete";
import SearchableEntityPicker from "@/components/admin/searchable-entity-picker";
import type { actionFunction } from "@/utils/types";
import CatalogForm from "./catalog-form";
import { CatalogField, CatalogSubmit } from "./catalog-fields";

type GroupSheet =
  | { mode: "create-name" }
  | { mode: "create-section" }
  | { mode: "edit"; groupId: string }
  | null;

export function MemberOrderPicker({
  attributes,
  value,
  onChange,
  allowEmpty = false,
}: {
  attributes: CatalogAttribute[];
  value: string[];
  onChange: (next: string[]) => void;
  allowEmpty?: boolean;
}) {
  const t = useTranslations("CatalogAdmin");
  const [pick, setPick] = useState("");
  const byId = useMemo(
    () => new Map(attributes.map((item) => [item.id, item])),
    [attributes]
  );
  const available = attributes.filter((item) => !value.includes(item.id));

  function move(index: number, direction: -1 | 1) {
    const next = [...value];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    const tmp = next[index];
    next[index] = next[target];
    next[target] = tmp;
    onChange(next);
  }

  return (
    <div className="grid gap-3">
      {available.length > 0 ? (
        <SearchableEntityPicker
          name="memberAttributePick"
          label={t("displayGroupAddMember")}
          placeholder={t("displayGroupPickField")}
          searchPlaceholder={t("displayGroupPickField")}
          emptyLabel="—"
          options={available.map((item) => ({
            value: item.id,
            label: item.inherited
              ? `${item.name} (${item.source.name})`
              : item.name,
            keywords: [
              item.name,
              item.key,
              item.source.name,
            ],
          }))}
          value={pick}
          onValueChange={(next) => {
            if (!next) {
              setPick("");
              return;
            }
            onChange([...value, next]);
            setPick("");
          }}
          allowClear={false}
        />
      ) : null}
      <p className="text-sm font-medium">{t("displayGroupMembers")}</p>
      {value.map((id, index) => {
        const attribute = byId.get(id);
        if (!attribute) return null;
        return (
          <div
            key={id}
            className="flex items-center justify-between gap-2 rounded-sm border px-3 py-2"
          >
            <input type="hidden" name="memberAttributeId" value={id} />
            <span className="min-w-0 truncate text-sm">{attribute.name}</span>
            <div className="flex shrink-0 items-center">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-muted-foreground"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label={t("moveUp")}
              >
                <LuArrowUp className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-muted-foreground"
                onClick={() => move(index, 1)}
                disabled={index === value.length - 1}
                aria-label={t("moveDown")}
              >
                <LuArrowDown className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-muted-foreground"
                onClick={() => onChange(value.filter((item) => item !== id))}
                aria-label={t("displayGroupRemoveMember")}
              >
                <LuX className="size-4" />
              </Button>
            </div>
          </div>
        );
      })}
      {value.length === 0 && !allowEmpty ? (
        <p className="text-sm text-muted-foreground">
          {t("displayGroupMembersHint")}
        </p>
      ) : null}
    </div>
  );
}

export default function DisplayGroupsPanel({
  node,
  attributes,
  groups,
}: {
  node: TaxonomyNodeRow;
  attributes: CatalogAttribute[];
  groups: CatalogDisplayGroup[];
}) {
  const t = useTranslations("CatalogAdmin");
  const [sheet, setSheet] = useState<GroupSheet>(null);
  const [sheetSavePending, setSheetSavePending] = useState(false);
  const [memberIds, setMemberIds] = useState<string[]>([]);

  const nameGroups = groups.filter((item) => item.writesProductName);
  const sectionGroups = groups.filter((item) => !item.writesProductName);

  const ownName = nameGroups.filter((item) => !item.inherited);
  const inheritedName = nameGroups.filter((item) => item.inherited);
  const ownSections = sectionGroups.filter((item) => !item.inherited);
  const inheritedSections = sectionGroups.filter((item) => item.inherited);

  const hasOwnNameTemplate = ownName.length > 0;

  const active =
    sheet && sheet.mode === "edit"
      ? groups.find((item) => item.id === sheet.groupId) ?? null
      : null;
  const editingName = Boolean(active?.writesProductName);

  function openCreateName() {
    setMemberIds([]);
    setSheet({ mode: "create-name" });
  }

  function openCreateSection() {
    setMemberIds([]);
    setSheet({ mode: "create-section" });
  }

  function openEdit(group: CatalogDisplayGroup) {
    setMemberIds(group.members.map((member) => member.attributeId));
    setSheet({ mode: "edit", groupId: group.id });
  }

  function renderGroupRow(
    group: CatalogDisplayGroup,
    opts: { editable: boolean; joinPreview: boolean }
  ) {
    const preview = opts.joinPreview
      ? group.members.map((m) => m.attribute.name).join(group.separator || " ")
      : group.members.map((m) => m.attribute.name).join(", ");

    return (
      <div
        key={group.id}
        className={
          opts.editable
            ? "flex items-start justify-between gap-4 rounded-sm border p-4"
            : "grid gap-2 rounded-sm border p-4"
        }
      >
        <div className="grid min-w-0 gap-2">
          <p className="font-medium">{group.name}</p>
          {group.inherited ? (
            <p className="text-xs text-muted-foreground">
              {t("declaredOn", { folder: group.source.name })}
              {preview ? ` · ${preview}` : ""}
            </p>
          ) : preview ? (
            <p className="text-xs text-muted-foreground">{preview}</p>
          ) : null}
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline">
              {t("displayGroupMembersCount", {
                count: group.members.length,
              })}
            </Badge>
          </div>
        </div>
        {opts.editable ? (
          <div className="flex shrink-0 items-center">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              onClick={() => openEdit(group)}
              aria-label={
                group.writesProductName
                  ? t("nameTemplateEdit")
                  : t("specSectionEdit")
              }
            >
              <LuPen className="size-4" />
            </Button>
            <ConfirmDeleteIcon
              action={deleteDisplayGroupAction as unknown as actionFunction}
              title={
                group.writesProductName
                  ? t("nameTemplateDeleteTitle")
                  : t("specSectionDeleteTitle")
              }
              description={
                group.writesProductName
                  ? t("nameTemplateDeleteSubject", { group: group.name })
                  : t("specSectionDeleteSubject", { group: group.name })
              }
            >
              <input type="hidden" name="groupId" value={group.id} />
            </ConfirmDeleteIcon>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
          <div className="grid gap-1">
            <p className="text-sm font-medium">{t("nameTemplateTitle")}</p>
            <p className="text-xs text-muted-foreground">
              {t("nameTemplateHint")}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={openCreateName}
            disabled={attributes.length === 0 || hasOwnNameTemplate}
          >
            <LuPlus className="size-4" />
            {t("nameTemplateAdd")}
          </Button>
        </CardHeader>
        <CardContent className="grid gap-3">
          {ownName.length === 0 && inheritedName.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("nameTemplateEmpty")}
            </p>
          ) : null}
          {ownName.map((group) =>
            renderGroupRow(group, { editable: true, joinPreview: true })
          )}
          {inheritedName.length > 0 ? (
            <div className="grid gap-3 pt-1">
              <p className="text-sm font-medium">{t("nameTemplateInherited")}</p>
              {inheritedName.map((group) =>
                renderGroupRow(group, { editable: false, joinPreview: true })
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
          <div className="grid gap-1">
            <p className="text-sm font-medium">{t("specSectionsTitle")}</p>
            <p className="text-xs text-muted-foreground">
              {t("specSectionsHint")}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={openCreateSection}
            disabled={attributes.length === 0}
          >
            <LuPlus className="size-4" />
            {t("specSectionsAdd")}
          </Button>
        </CardHeader>
        <CardContent className="grid gap-3">
          {ownSections.length === 0 && inheritedSections.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("specSectionsEmpty")}
            </p>
          ) : null}
          {ownSections.map((group) =>
            renderGroupRow(group, { editable: true, joinPreview: false })
          )}
          {inheritedSections.length > 0 ? (
            <div className="grid gap-3 pt-1">
              <p className="text-sm font-medium">{t("specSectionsInherited")}</p>
              {inheritedSections.map((group) =>
                renderGroupRow(group, { editable: false, joinPreview: false })
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Sheet
        open={sheet !== null}
        onOpenChange={(open) => {
          if (!open && sheetSavePending) return;
          if (!open) setSheet(null);
        }}
      >
        <SheetContent>
          {sheet?.mode === "create-name" ? (
            <div className="grid gap-6">
              <SheetHeader>
                <SheetTitle>{t("nameTemplateNew")}</SheetTitle>
                <SheetDescription>
                  {t("nameTemplateNewHint", { folder: node.name })}
                </SheetDescription>
              </SheetHeader>
              <CatalogForm
                className="grid gap-4"
                action={createDisplayGroupAction}
                onPendingChange={setSheetSavePending}
                onSuccess={() => setSheet(null)}
              >
                <input type="hidden" name="taxonomyNodeId" value={node.id} />
                <input type="hidden" name="writesProductName" value="on" />
                <CatalogField
                  name="name"
                  label={t("nameTemplateName")}
                  defaultValue={t("productNameTemplateGroupName")}
                />
                <CatalogField
                  name="separator"
                  label={t("displayGroupSeparator")}
                  defaultValue=" "
                  required={false}
                />
                <MemberOrderPicker
                  attributes={attributes}
                  value={memberIds}
                  onChange={setMemberIds}
                />
                <CatalogSubmit text={t("nameTemplateAdd")} className="w-fit" />
              </CatalogForm>
            </div>
          ) : null}

          {sheet?.mode === "create-section" ? (
            <div className="grid gap-6">
              <SheetHeader>
                <SheetTitle>{t("specSectionNew")}</SheetTitle>
                <SheetDescription>
                  {t("specSectionNewHint", { folder: node.name })}
                </SheetDescription>
              </SheetHeader>
              <CatalogForm
                className="grid gap-4"
                action={createDisplayGroupAction}
                onPendingChange={setSheetSavePending}
                onSuccess={() => setSheet(null)}
              >
                <input type="hidden" name="taxonomyNodeId" value={node.id} />
                <CatalogField name="name" label={t("specSectionName")} />
                <MemberOrderPicker
                  attributes={attributes}
                  value={memberIds}
                  onChange={setMemberIds}
                />
                <CatalogSubmit text={t("specSectionsAdd")} className="w-fit" />
              </CatalogForm>
            </div>
          ) : null}

          {sheet?.mode === "edit" && active ? (
            <div className="grid gap-6">
              <SheetHeader>
                <SheetTitle>
                  {editingName
                    ? t("nameTemplateEdit")
                    : t("specSectionEdit")}
                </SheetTitle>
                <SheetDescription>{active.key}</SheetDescription>
              </SheetHeader>
              <CatalogForm
                className="grid gap-4"
                action={updateDisplayGroupAction}
                onPendingChange={setSheetSavePending}
                onSuccess={() => setSheet(null)}
              >
                <input type="hidden" name="groupId" value={active.id} />
                {editingName ? (
                  <input type="hidden" name="writesProductName" value="on" />
                ) : null}
                <CatalogField
                  name="name"
                  label={
                    editingName ? t("nameTemplateName") : t("specSectionName")
                  }
                  defaultValue={active.name}
                />
                {editingName ? (
                  <CatalogField
                    name="separator"
                    label={t("displayGroupSeparator")}
                    defaultValue={active.separator}
                    required={false}
                  />
                ) : (
                  <input
                    type="hidden"
                    name="separator"
                    value={active.separator || " "}
                  />
                )}
                <MemberOrderPicker
                  attributes={attributes}
                  value={memberIds}
                  onChange={setMemberIds}
                />
                <CatalogSubmit
                  text={
                    editingName
                      ? t("nameTemplateSave")
                      : t("specSectionSave")
                  }
                  className="w-fit"
                />
              </CatalogForm>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
