"use client";

import { useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  formationTargetKey,
  resolveFormationTemplates,
} from "@/lib/catalog/display-group";
import {
  createDisplayGroupAction,
  deleteDisplayGroupAction,
  updateDisplayGroupAction,
} from "@/utils/taxonomy-actions";
import { LuArrowDown, LuArrowUp, LuPen, LuPlus, LuX } from "react-icons/lu";
import { ConfirmDeleteIcon } from "@/components/form/ConfirmDelete";
import SearchableEntityPicker from "@/components/admin/searchable-entity-picker";
import type { actionFunction } from "@/utils/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { notify } from "@/lib/ui/notify";
import { initialTaxonomyActionState } from "@/utils/taxonomy-action-state";
import { useRouter } from "@/i18n/navigation";

const TARGET_NAME = "__name__";

type GroupSheet =
  | { mode: "create" }
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
            keywords: [item.name, item.key, item.source.name],
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

function targetLabel(
  group: CatalogDisplayGroup,
  attributes: CatalogAttribute[],
  nameLabel: string
) {
  if (group.targetAttributeId) {
    return (
      attributes.find((item) => item.id === group.targetAttributeId)?.name ??
      group.name
    );
  }
  return nameLabel;
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
  const tCommon = useTranslations("Common");
  const router = useRouter();
  const [sheet, setSheet] = useState<GroupSheet>(null);
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [targetAttributeId, setTargetAttributeId] = useState(TARGET_NAME);
  const [templateName, setTemplateName] = useState("");
  const [separator, setSeparator] = useState(" ");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const textAttributes = useMemo(
    () => attributes.filter((item) => item.type === "TEXT"),
    [attributes]
  );

  const resolved = resolveFormationTemplates(groups);
  const own = resolved.filter((item) => !item.inherited);
  const inherited = resolved.filter((item) => item.inherited);

  const takenTargets = useMemo(() => {
    const set = new Set<string>();
    for (const group of own) {
      const key = formationTargetKey(group);
      if (key) set.add(key);
    }
    return set;
  }, [own]);

  const active =
    sheet && sheet.mode === "edit"
      ? resolved.find((item) => item.id === sheet.groupId) ?? null
      : null;

  const targetOptions = useMemo(() => {
    const options: { value: string; label: string; keywords: string[] }[] = [];
    const nameTaken =
      sheet?.mode === "edit" && active && !active.targetAttributeId
        ? false
        : takenTargets.has("name");
    if (!nameTaken || (sheet?.mode === "edit" && active && !active.targetAttributeId)) {
      options.push({
        value: TARGET_NAME,
        label: t("formationTargetName"),
        keywords: [t("formationTargetName"), "name"],
      });
    }
    for (const attr of textAttributes) {
      const key = `attr:${attr.id}`;
      const editingThis =
        sheet?.mode === "edit" && active?.targetAttributeId === attr.id;
      if (takenTargets.has(key) && !editingThis) continue;
      const label = attr.inherited
        ? `${attr.name} (${attr.source.name})`
        : attr.name;
      options.push({
        value: attr.id,
        label,
        keywords: [attr.name, attr.key, attr.source.name],
      });
    }
    return options;
  }, [textAttributes, takenTargets, sheet, active, t]);

  const memberCandidates = useMemo(() => {
    const exclude =
      targetAttributeId === TARGET_NAME ? null : targetAttributeId;
    return attributes.filter((item) => item.id !== exclude);
  }, [attributes, targetAttributeId]);

  function openCreate() {
    setMemberIds([]);
    const first = targetOptions[0]?.value ?? TARGET_NAME;
    setTargetAttributeId(first);
    setTemplateName(t("formationTemplateDefaultName"));
    setSeparator(" ");
    setSheet({ mode: "create" });
  }

  function openEdit(group: CatalogDisplayGroup) {
    setMemberIds(group.members.map((member) => member.attributeId));
    setTargetAttributeId(group.targetAttributeId ?? TARGET_NAME);
    setTemplateName(group.name);
    setSeparator(group.separator || " ");
    setSheet({ mode: "edit", groupId: group.id });
  }

  function buildFormData() {
    const formData = new FormData();
    formData.set("name", templateName);
    formData.set("separator", separator);
    formData.set("targetAttributeId", targetAttributeId);
    for (const id of memberIds) {
      formData.append("memberAttributeId", id);
    }
    if (sheet?.mode === "create") {
      formData.set("taxonomyNodeId", node.id);
    } else if (sheet?.mode === "edit") {
      formData.set("groupId", sheet.groupId);
    }
    return formData;
  }

  function runSave() {
    if (!sheet) return;
    const formData = buildFormData();
    const action =
      sheet.mode === "edit" ? updateDisplayGroupAction : createDisplayGroupAction;
    startTransition(async () => {
      const result = await action(initialTaxonomyActionState, formData);
      notify.fromAction(result);
      if (result.ok) {
        setConfirmOpen(false);
        setSheet(null);
        router.refresh();
      }
    });
  }

  function onSaveClick() {
    if (memberIds.length > 0) {
      setConfirmOpen(true);
      return;
    }
    runSave();
  }

  function renderGroupRow(
    group: CatalogDisplayGroup,
    opts: { editable: boolean }
  ) {
    const preview = group.members
      .map((m) => m.attribute.name)
      .join(group.separator || " ");
    const target = targetLabel(group, attributes, t("formationTargetName"));

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
          <p className="font-medium">{target}</p>
          {group.inherited ? (
            <p className="text-xs text-muted-foreground">
              {t("declaredOn", { folder: group.source.name })}
              {preview ? ` · ${preview}` : ""}
            </p>
          ) : preview ? (
            <p className="text-xs text-muted-foreground">{preview}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              {t("formationTemplateDisabled")}
            </p>
          )}
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
              aria-label={t("formationTemplateEdit")}
            >
              <LuPen className="size-4" />
            </Button>
            <ConfirmDeleteIcon
              action={deleteDisplayGroupAction as unknown as actionFunction}
              title={t("formationTemplateDeleteTitle")}
              description={t("formationTemplateDeleteSubject", {
                group: target,
              })}
            >
              <input type="hidden" name="groupId" value={group.id} />
            </ConfirmDeleteIcon>
          </div>
        ) : null}
      </div>
    );
  }

  const canAdd = targetOptions.length > 0;

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
          <div className="grid gap-1">
            <p className="text-sm font-medium">{t("formationTemplateTitle")}</p>
            <p className="text-xs text-muted-foreground">
              {t("formationTemplateHint")}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={openCreate}
            disabled={!canAdd}
          >
            <LuPlus className="size-4" />
            {t("formationTemplateAdd")}
          </Button>
        </CardHeader>
        <CardContent className="grid gap-3">
          {own.length === 0 && inherited.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("formationTemplateEmpty")}
            </p>
          ) : null}
          {own.map((group) => renderGroupRow(group, { editable: true }))}
          {inherited.length > 0 ? (
            <div className="grid gap-3 pt-1">
              <p className="text-sm font-medium">
                {t("formationTemplateInherited")}
              </p>
              {inherited.map((group) =>
                renderGroupRow(group, { editable: false })
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Sheet
        open={sheet !== null}
        onOpenChange={(open) => {
          if (!open && isPending) return;
          if (!open) setSheet(null);
        }}
      >
        <SheetContent>
          {sheet ? (
            <div className="grid gap-6">
              <SheetHeader>
                <SheetTitle>
                  {sheet.mode === "create"
                    ? t("formationTemplateNew")
                    : t("formationTemplateEdit")}
                </SheetTitle>
                <SheetDescription>
                  {sheet.mode === "create"
                    ? t("formationTemplateNewHint", { folder: node.name })
                    : (active?.key ?? "")}
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4">
                <SearchableEntityPicker
                  name="formationTargetPick"
                  label={t("formationTargetLabel")}
                  placeholder={t("formationTargetPick")}
                  searchPlaceholder={t("formationTargetPick")}
                  emptyLabel="—"
                  options={targetOptions}
                  value={targetAttributeId}
                  onValueChange={(next) => {
                    if (!next) return;
                    setTargetAttributeId(next);
                    setMemberIds((prev) =>
                      next === TARGET_NAME
                        ? prev
                        : prev.filter((id) => id !== next)
                    );
                  }}
                  allowClear={false}
                />
                <div className="grid gap-2">
                  <Label htmlFor="formation-template-name">
                    {t("formationTemplateName")}
                  </Label>
                  <Input
                    id="formation-template-name"
                    value={templateName}
                    onChange={(event) => setTemplateName(event.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="formation-separator">
                    {t("displayGroupSeparator")}
                  </Label>
                  <Input
                    id="formation-separator"
                    value={separator}
                    onChange={(event) => setSeparator(event.target.value)}
                  />
                </div>
                <MemberOrderPicker
                  attributes={memberCandidates}
                  value={memberIds}
                  onChange={setMemberIds}
                  allowEmpty
                />
                <Button
                  type="button"
                  className="w-fit"
                  disabled={isPending || templateName.trim().length < 2}
                  onClick={onSaveClick}
                >
                  {sheet.mode === "create"
                    ? t("formationTemplateAdd")
                    : t("formationTemplateSave")}
                </Button>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("formationTemplateRegenerateTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("formationTemplateRegenerateDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>
              {tCommon("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={(event) => {
                event.preventDefault();
                runSave();
              }}
            >
              {t("formationTemplateRegenerateConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
