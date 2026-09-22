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
import { LuArrowDown, LuArrowUp, LuPen, LuPlus, LuTrash2, LuX } from "react-icons/lu";
import SearchableEntityPicker from "@/components/admin/searchable-entity-picker";
import CatalogForm from "./catalog-form";
import {
  CatalogField,
  CatalogFlag,
  CatalogSubmit,
} from "./catalog-fields";

type GroupSheet =
  | { mode: "create" }
  | { mode: "edit"; groupId: string }
  | { mode: "delete"; groupId: string }
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
  const [memberIds, setMemberIds] = useState<string[]>([]);

  const own = groups.filter((item) => !item.inherited);
  const inherited = groups.filter((item) => item.inherited);
  const active =
    sheet && sheet.mode !== "create"
      ? groups.find((item) => item.id === sheet.groupId) ?? null
      : null;

  function openCreate() {
    setMemberIds([]);
    setSheet({ mode: "create" });
  }

  function openEdit(group: CatalogDisplayGroup) {
    setMemberIds(group.members.map((member) => member.attributeId));
    setSheet({ mode: "edit", groupId: group.id });
  }

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
          <div className="grid gap-1">
            <p className="text-sm font-medium">{t("displayGroupsTitle")}</p>
            <p className="text-xs text-muted-foreground">
              {t("displayGroupsHint")}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={openCreate}
            disabled={attributes.length === 0}
          >
            <LuPlus className="size-4" />
            {t("addDisplayGroup")}
          </Button>
        </CardHeader>
        <CardContent className="grid gap-3">
          {own.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("noDisplayGroups")}
            </p>
          ) : (
            own.map((group) => (
              <div
                key={group.id}
                className="flex items-start justify-between gap-4 rounded-sm border p-4"
              >
                <div className="grid min-w-0 gap-2">
                  <p className="font-medium">{group.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {group.members.map((m) => m.attribute.name).join(group.separator || " ")}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {group.writesProductName ? (
                      <Badge variant="secondary">
                        {t("flagWritesProductName")}
                      </Badge>
                    ) : null}
                    <Badge variant="outline">
                      {t("displayGroupMembersCount", {
                        count: group.members.length,
                      })}
                    </Badge>
                  </div>
                </div>
                <div className="flex shrink-0 items-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground"
                    onClick={() => openEdit(group)}
                    aria-label={t("editDisplayGroup")}
                  >
                    <LuPen className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground"
                    onClick={() =>
                      setSheet({ mode: "delete", groupId: group.id })
                    }
                    aria-label={t("deleteDisplayGroup")}
                  >
                    <LuTrash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
          {inherited.length > 0 ? (
            <div className="grid gap-3 pt-2">
              <p className="text-sm font-medium">{t("inheritedDisplayGroups")}</p>
              {inherited.map((group) => (
                <div
                  key={group.id}
                  className="grid gap-2 rounded-sm border p-4"
                >
                  <p className="font-medium">{group.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("declaredOn", { folder: group.source.name })} ·{" "}
                    {group.members.map((m) => m.attribute.name).join(group.separator || " ")}
                  </p>
                </div>
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
        <SheetContent>
          {sheet?.mode === "create" ? (
            <div className="grid gap-6">
              <SheetHeader>
                <SheetTitle>{t("newDisplayGroup")}</SheetTitle>
                <SheetDescription>
                  {t("newDisplayGroupHint", { folder: node.name })}
                </SheetDescription>
              </SheetHeader>
              <CatalogForm
                className="grid gap-4"
                action={createDisplayGroupAction}
                onSuccess={() => setSheet(null)}
              >
                <input type="hidden" name="taxonomyNodeId" value={node.id} />
                <CatalogField name="name" label={t("displayGroupName")} />
                <CatalogField
                  name="separator"
                  label={t("displayGroupSeparator")}
                  defaultValue=" "
                  required={false}
                />
                <CatalogFlag
                  name="writesProductName"
                  label={t("flagWritesProductName")}
                />
                <MemberOrderPicker
                  attributes={attributes}
                  value={memberIds}
                  onChange={setMemberIds}
                />
                <CatalogSubmit text={t("addDisplayGroup")} className="w-fit" />
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
                action={updateDisplayGroupAction}
                onSuccess={() => setSheet(null)}
              >
                <input type="hidden" name="groupId" value={active.id} />
                <CatalogField
                  name="name"
                  label={t("displayGroupName")}
                  defaultValue={active.name}
                />
                <CatalogField
                  name="separator"
                  label={t("displayGroupSeparator")}
                  defaultValue={active.separator}
                  required={false}
                />
                <CatalogFlag
                  name="writesProductName"
                  label={t("flagWritesProductName")}
                  defaultChecked={active.writesProductName}
                />
                <MemberOrderPicker
                  attributes={attributes}
                  value={memberIds}
                  onChange={setMemberIds}
                />
                <CatalogSubmit
                  text={t("saveDisplayGroup")}
                  className="w-fit"
                />
              </CatalogForm>
            </div>
          ) : null}

          {sheet?.mode === "delete" && active ? (
            <div className="grid gap-6">
              <SheetHeader>
                <SheetTitle>{t("deleteDisplayGroupTitle")}</SheetTitle>
                <SheetDescription>
                  {t("deleteDisplayGroupSubject", { group: active.name })}
                </SheetDescription>
              </SheetHeader>
              <CatalogForm
                className="flex items-center gap-3"
                action={deleteDisplayGroupAction}
                onSuccess={() => setSheet(null)}
              >
                <input type="hidden" name="groupId" value={active.id} />
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
