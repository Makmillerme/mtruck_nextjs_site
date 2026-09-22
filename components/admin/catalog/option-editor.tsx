"use client";

import { useTranslations } from "next-intl";
import { ConfirmDeleteIcon } from "@/components/form/ConfirmDelete";
import type { CatalogAttribute } from "@/lib/catalog/types";
import {
  createAttributeOptionAction,
  deleteAttributeOptionAction,
} from "@/utils/taxonomy-actions";
import type { actionFunction } from "@/utils/types";
import CatalogForm from "./catalog-form";
import { CatalogField, CatalogSubmit } from "./catalog-fields";

function OptionRow({
  option,
}: {
  option: CatalogAttribute["options"][number];
}) {
  const t = useTranslations("CatalogAdmin");
  return (
    <li className="flex min-h-9 items-center justify-between gap-3">
      <span className="truncate text-sm">{option.label}</span>
      <ConfirmDeleteIcon
        action={deleteAttributeOptionAction as unknown as actionFunction}
        title={t("deleteOption")}
        className="shrink-0 text-muted-foreground"
      >
        <input type="hidden" name="optionId" value={option.id} />
      </ConfirmDeleteIcon>
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

  if (attribute.type !== "SELECT") return null;

  if (!attribute.dependsOnAttributeId) {
    return (
      <div className="grid gap-3">
        <p className="text-sm font-medium">{t("optionsTitle")}</p>
        <ul className="grid gap-1">
          {attribute.options.map((option) => (
            <OptionRow key={option.id} option={option} />
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
                  <OptionRow key={option.id} option={option} />
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
