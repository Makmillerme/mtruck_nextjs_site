import FormContainer from "@/components/form/FormContainer";
import { IconButton, SubmitButton } from "@/components/form/Buttons";
import type { CatalogAttribute } from "@/lib/catalog/types";
import {
  createAttributeOptionAction,
  deleteAttributeOptionAction,
} from "@/utils/taxonomy-actions";
import { getTranslations } from "next-intl/server";
import { CatalogField } from "./catalog-fields";

export default async function OptionEditor({
  attribute,
  parentOptions,
}: {
  attribute: CatalogAttribute;
  parentOptions: CatalogAttribute["options"];
}) {
  const t = await getTranslations("CatalogAdmin");
  if (attribute.type !== "SELECT") {
    return (
      <p className="text-sm text-muted-foreground">{t("optionsOnlyForSelect")}</p>
    );
  }

  if (!attribute.dependsOnAttributeId) {
    return (
      <div className="grid gap-3">
        <ul className="grid gap-2">
          {attribute.options.map((option) => (
            <li key={option.id} className="flex items-center justify-between gap-2">
              <span className="text-sm">{option.label}</span>
              <FormContainer action={deleteAttributeOptionAction}>
                <input type="hidden" name="optionId" value={option.id} />
                <IconButton actionType="delete" />
              </FormContainer>
            </li>
          ))}
        </ul>
        <FormContainer action={createAttributeOptionAction}>
          <input type="hidden" name="attributeId" value={attribute.id} />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <CatalogField name="label" label={t("optionLabel")} />
            </div>
            <SubmitButton text={t("addOption")} size="sm" className="w-fit" />
          </div>
        </FormContainer>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {parentOptions.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("addParentOptionsFirst")}</p>
      ) : (
        parentOptions.map((parent) => {
          const children = attribute.options.filter(
            (option) => option.parentOptionId === parent.id
          );
          return (
            <div key={parent.id} className="grid gap-3 rounded-sm border p-3">
              <p className="text-sm font-medium">
                {t("optionsForParent", { parent: parent.label })}
              </p>
              <ul className="grid gap-2">
                {children.map((option) => (
                  <li
                    key={option.id}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="text-sm">{option.label}</span>
                    <FormContainer action={deleteAttributeOptionAction}>
                      <input type="hidden" name="optionId" value={option.id} />
                      <IconButton actionType="delete" />
                    </FormContainer>
                  </li>
                ))}
              </ul>
              <FormContainer action={createAttributeOptionAction}>
                <input type="hidden" name="attributeId" value={attribute.id} />
                <input type="hidden" name="parentOptionId" value={parent.id} />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="min-w-0 flex-1">
                    <CatalogField name="label" label={t("optionLabel")} />
                  </div>
                  <SubmitButton text={t("addOption")} size="sm" className="w-fit" />
                </div>
              </FormContainer>
            </div>
          );
        })
      )}
    </div>
  );
}
