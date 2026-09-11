import ProductFolderPicker from "@/components/admin/catalog/product-folder-picker";
import ProductSpecFields from "@/components/admin/catalog/product-spec-fields";
import { SubmitButton } from "@/components/form/Buttons";
import CheckboxInput from "@/components/form/CheckboxInput";
import FormContainer from "@/components/form/FormContainer";
import FormInput from "@/components/form/FormInput";
import ImageInput from "@/components/form/ImageInput";
import PriceInput from "@/components/form/PriceInput";
import TextAreaInput from "@/components/form/TextAreaInput";
import {
  CatalogNativeSelect,
} from "@/components/admin/catalog/catalog-fields";
import {
  fetchAttributesForNode,
  fetchTaxonomyTree,
  flattenTaxonomyTree,
  resolveAttributesByKey,
} from "@/lib/catalog/taxonomy";
import { createProductAction } from "@/utils/actions";
import { faker } from "@faker-js/faker";
import { getTranslations } from "next-intl/server";

async function CreateProductPage(props: {
  searchParams: Promise<{ node?: string }>;
}) {
  const searchParams = await props.searchParams;
  const t = await getTranslations("Admin");
  const catalogT = await getTranslations("CatalogAdmin");
  const name = faker.commerce.productName();
  const company = faker.company.name();
  const description = faker.lorem.paragraph({ min: 10, max: 12 });
  const tree = await fetchTaxonomyTree();
  const folders = flattenTaxonomyTree(tree).map((node) => ({
    id: node.id,
    name: node.name,
    depth: node.depth,
  }));
  const selectedId = searchParams.node;
  const selectedExists = selectedId
    ? folders.some((folder) => folder.id === selectedId)
    : false;
  const attributes = selectedExists && selectedId
    ? resolveAttributesByKey(await fetchAttributesForNode(selectedId))
    : [];

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-8">{t("createProduct")}</h1>
      <div className="border p-8 rounded-md">
        <FormContainer action={createProductAction}>
          <div className="grid gap-4 md:grid-cols-2 my-4">
            <ProductFolderPicker
              folders={folders}
              selectedId={selectedExists ? selectedId : undefined}
            />
            <CatalogNativeSelect
              name="status"
              label={t("status")}
              defaultValue="PUBLISHED"
            >
              <option value="DRAFT">{t("statusDraft")}</option>
              <option value="PUBLISHED">{t("statusPublished")}</option>
              <option value="RESERVED">{t("statusReserved")}</option>
              <option value="PREPARING">{t("statusPreparing")}</option>
              <option value="SOLD">{t("statusSold")}</option>
            </CatalogNativeSelect>
            <CatalogNativeSelect
              name="availability"
              label={t("availability")}
              defaultValue="IN_STOCK"
            >
              <option value="IN_STOCK">{t("availabilityStock")}</option>
              <option value="TRANSIT">{t("availabilityTransit")}</option>
            </CatalogNativeSelect>
            <FormInput
              type="text"
              name="name"
              label={t("productName")}
              defaultValue={name}
            />
            <FormInput
              type="text"
              name="company"
              label={t("company")}
              defaultValue={company}
            />
            <PriceInput />
            <ImageInput />
          </div>
          {attributes.length > 0 ? (
            <div className="my-6">
              <ProductSpecFields attributes={attributes} />
            </div>
          ) : selectedExists ? (
            <p className="my-4 text-sm text-muted-foreground">
              {catalogT("noOwnFields")}
            </p>
          ) : null}
          <TextAreaInput
            name="description"
            labelText={t("description")}
            defaultValue={description}
          />
          <div className="mt-6">
            <CheckboxInput name="featured" label={t("featured")} />
          </div>
          <SubmitButton text={t("submitCreate")} className="mt-8" />
        </FormContainer>
      </div>
    </section>
  );
}
export default CreateProductPage;
