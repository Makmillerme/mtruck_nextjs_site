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
        const label = attribute?.name ?? id;
        return (
          <div
            key={id}
            className="flex items-center justify-between gap-2 rounded-sm border px-3 py-2"
          >
            <input type="hidden" name="memberAttributeId" value={id} />
            <span className="min-w-0 truncate text-sm">{label}</span>
            <div className="flex shrink-0 items-center">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-muted-foreground"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  move(index, -1);
                }}
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
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  move(index, 1);
                }}
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
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onChange(value.filter((item) => item !== id));
                }}
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
  const ownName = nameGroups.filter((item) => !item.inherited);
  const inheritedName = nameGroups.filter((item) => item.inherited);
  const hasOwnNameTemplate = ownName.length > 0;

  const active =
    sheet && sheet.mode === "edit"
      ? nameGroups.find((item) => item.id === sheet.groupId) ?? null
      : null;

  function openCreateName() {
    setMemberIds([]);
    setSheet({ mode: "create-name" });
  }

  function openEdit(group: CatalogDisplayGroup) {
    setMemberIds(group.members.map((member) => member.attributeId));
    setSheet({ mode: "edit", groupId: group.id });
  }

  function renderGroupRow(
    group: CatalogDisplayGroup,
    opts: { editable: boolean }
  ) {
    const preview = group.members
      .map((m) => m.attribute.name)
      .join(group.separator || " ");

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
              aria-label={t("nameTemplateEdit")}
            >
              <LuPen className="size-4" />
            </Button>
            <ConfirmDeleteIcon
              action={deleteDisplayGroupAction as unknown as actionFunction}
              title={t("nameTemplateDeleteTitle")}
              description={t("nameTemplateDeleteSubject", {
                group: group.name,
              })}
            >
              <input type="hidden" name="groupId" value={group.id} />
            </ConfirmDeleteIcon>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <>
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
            renderGroupRow(group, { editable: true })
          )}
          {inheritedName.length > 0 ? (
            <div className="grid gap-3 pt-1">
              <p className="text-sm font-medium">{t("nameTemplateInherited")}</p>
              {inheritedName.map((group) =>
                renderGroupRow(group, { editable: false })
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

          {sheet?.mode === "edit" && active ? (
            <div className="grid gap-6">
              <SheetHeader>
                <SheetTitle>{t("nameTemplateEdit")}</SheetTitle>
                <SheetDescription>{active.key}</SheetDescription>
              </SheetHeader>
              <CatalogForm
                className="grid gap-4"
                action={updateDisplayGroupAction}
                onPendingChange={setSheetSavePending}
                onSuccess={() => setSheet(null)}
              >
                <input type="hidden" name="groupId" value={active.id} />
                <input type="hidden" name="writesProductName" value="on" />
                <CatalogField
                  name="name"
                  label={t("nameTemplateName")}
                  defaultValue={active.name}
                />
                <CatalogField
                  name="separator"
                  label={t("displayGroupSeparator")}
                  defaultValue={active.separator}
                  required={false}
                />
                <MemberOrderPicker
                  attributes={attributes}
                  value={memberIds}
                  onChange={setMemberIds}
                />
                <CatalogSubmit
                  text={t("nameTemplateSave")}
                  className="w-fit"
                />
              </CatalogForm>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
