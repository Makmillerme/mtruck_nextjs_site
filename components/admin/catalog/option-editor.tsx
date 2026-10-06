"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { LuPen, LuPlus, LuSearch } from "react-icons/lu";
import { ConfirmDeleteFormButton } from "@/components/form/ConfirmDelete";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { CatalogAttribute } from "@/lib/catalog/types";
import {
  createAttributeOptionAction,
  deleteAttributeOptionAction,
  updateAttributeOptionAction,
} from "@/utils/taxonomy-actions";
import CatalogForm from "./catalog-form";
import {
  CatalogField,
  CatalogMenuSelect,
  CatalogSubmit,
} from "./catalog-fields";

const OPTION_TAG_EDIT_CLASS =
  "absolute -right-1.5 -top-1.5 z-10 size-6 shrink-0 rounded-full border border-border bg-background text-foreground shadow-sm hover:bg-foreground hover:text-background";

const OPTION_DIALOG_CONTENT_CLASS = "sm:max-w-md";

type OptionItem = CatalogAttribute["options"][number];

function ParentSelect({
  parentOptions,
  defaultValue,
}: {
  parentOptions: OptionItem[];
  defaultValue?: string;
}) {
  const t = useTranslations("CatalogAdmin");
  return (
    <CatalogMenuSelect
      name="parentOptionId"
      label={t("optionParentLabel")}
      options={parentOptions.map((parent) => ({
        value: parent.id,
        label: parent.label,
      }))}
      defaultValue={defaultValue}
      placeholder={t("optionParentPlaceholder")}
      searchPlaceholder={t("optionParentSearch")}
      required
    />
  );
}

function CreateOptionDialog({
  open,
  onOpenChange,
  attributeId,
  parentOptions,
  dependsOnParent,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attributeId: string;
  parentOptions: OptionItem[];
  dependsOnParent: boolean;
}) {
  const t = useTranslations("CatalogAdmin");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={OPTION_DIALOG_CONTENT_CLASS}>
        <DialogHeader>
          <DialogTitle>{t("createOptionTitle")}</DialogTitle>
        </DialogHeader>
        <CatalogForm
          className="grid gap-4"
          action={createAttributeOptionAction}
          onSuccess={() => onOpenChange(false)}
        >
          <input type="hidden" name="attributeId" value={attributeId} />
          {dependsOnParent ? (
            <ParentSelect parentOptions={parentOptions} />
          ) : null}
          <CatalogField name="label" label={t("optionLabel")} />
          <DialogFooter>
            <CatalogSubmit text={t("addOption")} className="w-fit" />
          </DialogFooter>
        </CatalogForm>
      </DialogContent>
    </Dialog>
  );
}

function EditOptionDialog({
  open,
  onOpenChange,
  option,
  parentOptions,
  dependsOnParent,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  option: OptionItem | null;
  parentOptions: OptionItem[];
  dependsOnParent: boolean;
}) {
  const t = useTranslations("CatalogAdmin");

  if (!option) return null;

  const deleteFormId = `delete-option-${option.id}`;

  return (
    <>
      <CatalogForm
        id={deleteFormId}
        action={deleteAttributeOptionAction}
        className="hidden"
        onSuccess={() => onOpenChange(false)}
      >
        <input type="hidden" name="optionId" value={option.id} />
      </CatalogForm>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={OPTION_DIALOG_CONTENT_CLASS}>
          <DialogHeader>
            <DialogTitle>{t("editOptionTitle")}</DialogTitle>
          </DialogHeader>
          <CatalogForm
            key={option.id}
            className="grid gap-4"
            action={updateAttributeOptionAction}
            onSuccess={() => onOpenChange(false)}
          >
            <input type="hidden" name="optionId" value={option.id} />
            {dependsOnParent ? (
              <ParentSelect
                parentOptions={parentOptions}
                defaultValue={option.parentOptionId ?? undefined}
              />
            ) : null}
            <CatalogField
              name="label"
              label={t("optionLabel")}
              defaultValue={option.label}
            />
            <DialogFooter>
              <CatalogSubmit text={t("saveOption")} className="w-fit" />
              <ConfirmDeleteFormButton
                formId={deleteFormId}
                label={t("deleteOption")}
                title={t("deleteOption")}
                mode="delete"
              />
            </DialogFooter>
          </CatalogForm>
        </DialogContent>
      </Dialog>
    </>
  );
}

function OptionTag({
  option,
  displayLabel,
  onEdit,
}: {
  option: OptionItem;
  displayLabel: string;
  onEdit: (option: OptionItem) => void;
}) {
  const t = useTranslations("CatalogAdmin");

  return (
    <li className="relative overflow-visible pt-1.5 pr-1.5">
      <Badge variant="tag" className="max-w-[16rem] truncate pe-2">
        {displayLabel}
      </Badge>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className={OPTION_TAG_EDIT_CLASS}
        aria-label={t("editOption")}
        onClick={() => onEdit(option)}
      >
        <LuPen className="size-3" aria-hidden />
      </Button>
    </li>
  );
}

function OptionTagList({
  items,
  onEdit,
}: {
  items: { option: OptionItem; displayLabel: string }[];
  onEdit: (option: OptionItem) => void;
}) {
  if (items.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map(({ option, displayLabel }) => (
        <OptionTag
          key={option.id}
          option={option}
          displayLabel={displayLabel}
          onEdit={onEdit}
        />
      ))}
    </ul>
  );
}

export default function OptionEditor({
  attribute,
  parentOptions,
}: {
  attribute: CatalogAttribute;
  parentOptions: CatalogAttribute["options"];
}) {
  const t = useTranslations("CatalogAdmin");
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOption, setEditOption] = useState<OptionItem | null>(null);

  const dependsOnParent = Boolean(attribute.dependsOnAttributeId);
  const parentById = useMemo(() => {
    const map = new Map<string, string>();
    for (const parent of parentOptions) {
      map.set(parent.id, parent.label);
    }
    return map;
  }, [parentOptions]);

  const tagItems = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    return attribute.options
      .map((option) => {
        const parentLabel = option.parentOptionId
          ? (parentById.get(option.parentOptionId) ?? "")
          : "";
        const displayLabel =
          dependsOnParent && parentLabel
            ? `${option.label} · ${parentLabel}`
            : option.label;
        return { option, displayLabel, parentLabel };
      })
      .filter(({ option, displayLabel, parentLabel }) => {
        if (!q) return true;
        return (
          option.label.toLocaleLowerCase().includes(q) ||
          parentLabel.toLocaleLowerCase().includes(q) ||
          displayLabel.toLocaleLowerCase().includes(q)
        );
      })
      .map(({ option, displayLabel }) => ({ option, displayLabel }));
  }, [attribute.options, dependsOnParent, parentById, query]);

  if (attribute.type !== "SELECT") return null;

  if (dependsOnParent && parentOptions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{t("addParentOptionsFirst")}</p>
    );
  }

  const createDisabled = dependsOnParent && parentOptions.length === 0;

  return (
    <div className="grid gap-3">
      <div className="flex w-full min-w-0 items-end gap-2">
        <div className="relative min-w-0 flex-1">
          <label htmlFor="option-search" className="sr-only">
            {t("optionSearchPlaceholder")}
          </label>
          <LuSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="option-search"
            type="search"
            value={query}
            placeholder={t("optionSearchPlaceholder")}
            className="h-11 min-w-0 pl-9"
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-11 shrink-0 gap-2"
          disabled={createDisabled}
          onClick={() => setCreateOpen(true)}
        >
          <LuPlus className="size-4 shrink-0" />
          {t("addOption")}
        </Button>
      </div>

      {tagItems.length > 0 ? (
        <OptionTagList items={tagItems} onEdit={setEditOption} />
      ) : (
        <p className="text-sm text-muted-foreground">{t("optionSearchEmpty")}</p>
      )}

      <CreateOptionDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        attributeId={attribute.id}
        parentOptions={parentOptions}
        dependsOnParent={dependsOnParent}
      />
      <EditOptionDialog
        open={editOption != null}
        onOpenChange={(open) => {
          if (!open) setEditOption(null);
        }}
        option={editOption}
        parentOptions={parentOptions}
        dependsOnParent={dependsOnParent}
      />
    </div>
  );
}
