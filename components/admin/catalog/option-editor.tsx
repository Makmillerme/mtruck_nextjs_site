"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { CatalogAttribute } from "@/lib/catalog/types";
import {
  createAttributeOptionAction,
  deleteAttributeOptionAction,
} from "@/utils/taxonomy-actions";
import { LuTrash2 } from "react-icons/lu";
import CatalogForm from "./catalog-form";
import { CatalogField, CatalogSubmit } from "./catalog-fields";

function OptionRow({
  option,
  confirmId,
  onConfirm,
}: {
  option: CatalogAttribute["options"][number];
  confirmId: string | null;
  onConfirm: (id: string | null) => void;
}) {
  const t = useTranslations("CatalogAdmin");
  return (
    <li className="flex min-h-9 items-center justify-between gap-3">
      <span className="truncate text-sm">{option.label}</span>
      {confirmId === option.id ? (
        <CatalogForm
          className="flex shrink-0 items-center gap-2"
          action={deleteAttributeOptionAction}
          onSuccess={() => onConfirm(null)}
        >
          <input type="hidden" name="optionId" value={option.id} />
          <CatalogSubmit
            text={t("confirmDelete")}
            variant="destructive"
            size="sm"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onConfirm(null)}
          >
            {t("cancel")}
          </Button>
        </CatalogForm>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 text-muted-foreground"
          onClick={() => onConfirm(option.id)}
          aria-label={t("deleteOption")}
        >
          <LuTrash2 className="size-4" />
        </Button>
      )}
    </li>
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
  const [confirmId, setConfirmId] = useState<string | null>(null);

  if (attribute.type !== "SELECT") return null;

  if (!attribute.dependsOnAttributeId) {
    return (
      <div className="grid gap-3">
        <p className="text-sm font-medium">{t("optionsTitle")}</p>
        <ul className="grid gap-1">
          {attribute.options.map((option) => (
            <OptionRow
              key={option.id}
              option={option}
              confirmId={confirmId}
              onConfirm={setConfirmId}
            />
          ))}
        </ul>
        <CatalogForm
          className="flex items-end gap-3"
          action={createAttributeOptionAction}
        >
          <input type="hidden" name="attributeId" value={attribute.id} />
          <div className="min-w-0 flex-1">
            <CatalogField name="label" label={t("optionLabel")} />
          </div>
          <CatalogSubmit text={t("addOption")} variant="outline" />
        </CatalogForm>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <p className="text-sm font-medium">{t("optionsTitle")}</p>
      {parentOptions.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("addParentOptionsFirst")}</p>
      ) : (
        parentOptions.map((parent) => (
          <div key={parent.id} className="grid gap-3 rounded-sm border p-4">
            <p className="text-sm font-medium">
              {t("optionsForParent", { parent: parent.label })}
            </p>
            <ul className="grid gap-1">
              {attribute.options
                .filter((option) => option.parentOptionId === parent.id)
                .map((option) => (
                  <OptionRow
                    key={option.id}
                    option={option}
                    confirmId={confirmId}
                    onConfirm={setConfirmId}
                  />
                ))}
            </ul>
            <CatalogForm
              className="flex items-end gap-3"
              action={createAttributeOptionAction}
            >
              <input type="hidden" name="attributeId" value={attribute.id} />
              <input type="hidden" name="parentOptionId" value={parent.id} />
              <div className="min-w-0 flex-1">
                <CatalogField name="label" label={t("optionLabel")} />
              </div>
              <CatalogSubmit text={t("addOption")} variant="outline" />
            </CatalogForm>
          </div>
        ))
      )}
    </div>
  );
}
