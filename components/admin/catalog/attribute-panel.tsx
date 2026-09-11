import FormContainer from "@/components/form/FormContainer";
import { IconButton, SubmitButton } from "@/components/form/Buttons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ATTRIBUTE_TYPES, type CatalogAttribute } from "@/lib/catalog/types";
import type { TaxonomyNodeRow } from "@/lib/catalog/types";
import {
  createAttributeAction,
  createTaxonomyNodeAction,
  deleteAttributeAction,
  renameTaxonomyNodeAction,
  updateAttributeAction,
} from "@/utils/taxonomy-actions";
import { getTranslations } from "next-intl/server";
import {
  CatalogField,
  CatalogFlag,
  CatalogNativeSelect,
} from "./catalog-fields";
import OptionEditor from "./option-editor";

function parentOptionsFor(attribute: CatalogAttribute, all: CatalogAttribute[]) {
  if (!attribute.dependsOnAttributeId) return [];
  return (
    all.find((item) => item.id === attribute.dependsOnAttributeId)?.options ?? []
  );
}

export default async function AttributePanel({
  node,
  path,
  attributes,
}: {
  node: TaxonomyNodeRow;
  path: TaxonomyNodeRow[];
  attributes: CatalogAttribute[];
}) {
  const t = await getTranslations("CatalogAdmin");
  const own = attributes.filter((item) => !item.inherited);
  const inherited = attributes.filter((item) => item.inherited);
  const selectFields = attributes.filter((item) => item.type === "SELECT");
  const pathLabel = path.map((item) => item.name).join(" / ");

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{node.name}</CardTitle>
          <CardDescription>{pathLabel}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <p className="text-sm text-muted-foreground">{t("inheritHint")}</p>
          <FormContainer action={renameTaxonomyNodeAction}>
            <input type="hidden" name="nodeId" value={node.id} />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1">
                <CatalogField
                  name="name"
                  label={t("folderName")}
                  defaultValue={node.name}
                />
              </div>
              <SubmitButton text={t("renameFolder")} size="sm" className="w-fit" />
            </div>
          </FormContainer>
          <FormContainer action={createTaxonomyNodeAction}>
            <input type="hidden" name="parentId" value={node.id} />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1">
                <CatalogField name="name" label={t("childFolderName")} />
              </div>
              <SubmitButton text={t("addChildFolder")} size="sm" className="w-fit" />
            </div>
          </FormContainer>
          <p className="text-xs text-muted-foreground">
            {t("slugLabel", { slug: node.slug })}
          </p>
        </CardContent>
      </Card>

      {inherited.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("inheritedFields")}</CardTitle>
            <CardDescription>{t("inheritedHint")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {inherited.map((attribute) => (
              <div key={attribute.id} className="grid gap-3 rounded-sm border p-4">
                <div className="grid gap-1">
                  <p className="font-medium">{attribute.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("declaredOn", { folder: attribute.source.name })} · {attribute.key} ·{" "}
                    {t(`type.${attribute.type}`)}
                    {attribute.dependsOn
                      ? ` · ${t("dependsOnLabel", { field: attribute.dependsOn.name })}`
                      : ""}
                  </p>
                </div>
                <FormContainer action={createAttributeAction}>
                  <input type="hidden" name="taxonomyNodeId" value={node.id} />
                  <input
                    type="hidden"
                    name="dependsOnAttributeId"
                    value={attribute.id}
                  />
                  <div className="grid gap-3 md:grid-cols-2">
                    <CatalogField name="name" label={t("dependentFieldName")} />
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
                  </div>
                  <div className="mt-3 flex flex-wrap gap-4">
                    <CatalogFlag name="isRequired" label={t("flagRequired")} />
                    <CatalogFlag name="isFacet" label={t("flagFacet")} defaultChecked />
                    <CatalogFlag name="isIdentity" label={t("flagIdentity")} />
                  </div>
                  <SubmitButton
                    text={t("addDependentField")}
                    size="sm"
                    className="mt-3 w-fit"
                  />
                </FormContainer>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{t("ownFields")}</CardTitle>
          <CardDescription>{t("ownFieldsHint")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          {own.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noOwnFields")}</p>
          ) : (
            own.map((attribute) => (
              <div key={attribute.id} className="grid gap-4 rounded-sm border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="grid gap-1">
                    <p className="font-medium">{attribute.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {attribute.key} · {t(`type.${attribute.type}`)}
                      {attribute.dependsOn
                        ? ` · ${t("dependsOnLabel", { field: attribute.dependsOn.name })}`
                        : ""}
                    </p>
                  </div>
                  <FormContainer action={deleteAttributeAction}>
                    <input type="hidden" name="attributeId" value={attribute.id} />
                    <IconButton actionType="delete" />
                  </FormContainer>
                </div>
                <FormContainer action={updateAttributeAction}>
                  <input type="hidden" name="attributeId" value={attribute.id} />
                  <div className="grid gap-3 md:grid-cols-2">
                    <CatalogField
                      name="name"
                      label={t("fieldName")}
                      defaultValue={attribute.name}
                    />
                    <CatalogField
                      name="unit"
                      label={t("unit")}
                      defaultValue={attribute.unit ?? ""}
                      required={false}
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-4">
                    <CatalogFlag
                      name="isRequired"
                      label={t("flagRequired")}
                      defaultChecked={attribute.isRequired}
                    />
                    <CatalogFlag
                      name="isFacet"
                      label={t("flagFacet")}
                      defaultChecked={attribute.isFacet}
                    />
                    <CatalogFlag
                      name="isIdentity"
                      label={t("flagIdentity")}
                      defaultChecked={attribute.isIdentity}
                    />
                  </div>
                  <SubmitButton text={t("saveField")} size="sm" className="mt-3 w-fit" />
                </FormContainer>
                <OptionEditor
                  attribute={attribute}
                  parentOptions={parentOptionsFor(attribute, attributes)}
                />
              </div>
            ))
          )}

          <div className="grid gap-3 border-t pt-6">
            <p className="font-medium">{t("newField")}</p>
            <FormContainer action={createAttributeAction}>
              <input type="hidden" name="taxonomyNodeId" value={node.id} />
              <div className="grid gap-3 md:grid-cols-2">
                <CatalogField name="name" label={t("fieldName")} />
                <CatalogNativeSelect name="type" label={t("fieldType")} defaultValue="SELECT">
                  {ATTRIBUTE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {t(`type.${type}`)}
                    </option>
                  ))}
                </CatalogNativeSelect>
                <CatalogNativeSelect name="dependsOnAttributeId" label={t("dependsOn")}>
                  <option value="">{t("dependsOnNone")}</option>
                  {selectFields.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                      {item.inherited ? ` (${item.source.name})` : ""}
                    </option>
                  ))}
                </CatalogNativeSelect>
                <CatalogField name="unit" label={t("unit")} required={false} />
              </div>
              <div className="mt-3 flex flex-wrap gap-4">
                <CatalogFlag name="isRequired" label={t("flagRequired")} />
                <CatalogFlag name="isFacet" label={t("flagFacet")} defaultChecked />
                <CatalogFlag name="isIdentity" label={t("flagIdentity")} />
              </div>
              <SubmitButton text={t("addField")} size="sm" className="mt-3 w-fit" />
            </FormContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
