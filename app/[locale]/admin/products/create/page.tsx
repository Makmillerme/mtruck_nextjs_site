import ProductFolderPicker from "@/components/admin/catalog/product-folder-picker";
import ProductSpecFields from "@/components/admin/catalog/product-spec-fields";
import { SubmitButton } from "@/components/form/Buttons";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
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
    <section className="grid gap-6">
      <div className="grid gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">{t("createProduct")}</h1>
      </div>
      <Card className="shadow-sm">
        <CardContent className="p-6">
        <FormContainer action={createProductAction}>
          <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-2">
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
            <ProductSpecFields attributes={attributes} />
          ) : selectedExists ? (
            <p className="text-sm text-muted-foreground">
              {catalogT("noOwnFields")}
            </p>
          ) : null}
          <TextAreaInput
            name="description"
            labelText={t("description")}
            defaultValue={description}
          />
          <CheckboxInput name="featured" label={t("featured")} />
          <SubmitButton text={t("submitCreate")} className="w-fit" />
          </div>
        </FormContainer>
        </CardContent>
      </Card>
    </section>
  );
}
export default CreateProductPage;
