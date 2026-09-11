import {
  fetchAdminProductDetails,
  updateProductAction,
  updateProductImageAction,
} from '@/utils/actions';
import FormContainer from '@/components/form/FormContainer';
import FormInput from '@/components/form/FormInput';
import PriceInput from '@/components/form/PriceInput';
import TextAreaInput from '@/components/form/TextAreaInput';
import { SubmitButton } from '@/components/form/Buttons';
import CheckboxInput from '@/components/form/CheckboxInput';
import ImageInputContainer from '@/components/form/ImageInputContainer';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { getTranslations } from 'next-intl/server';

async function EditProductPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const t = await getTranslations('Admin');
  const { id } = params;
  const product = await fetchAdminProductDetails(id);
  const { name, company, description, featured, price } = product;
  return (
    <section className="grid gap-6">
      <Card className="shadow-sm">
        <CardContent className="grid gap-6 p-6">
          <ImageInputContainer
            action={updateProductImageAction}
            name={name}
            image={product.image}
            text={t('updateImage')}
          >
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="url" value={product.image} />
          </ImageInputContainer>
          <FormContainer action={updateProductAction}>
            <div className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-2">
              <input type="hidden" name="id" value={id} />
              <FormInput
                type="text"
                name="name"
                label={t('productName')}
                defaultValue={name}
              />
              <FormInput
                type="text"
                name="company"
                label={t('company')}
                defaultValue={company}
              />
              <PriceInput defaultValue={price} />
            </div>
            <TextAreaInput
              name="description"
              labelText={t('description')}
              defaultValue={description}
            />
            <CheckboxInput
              name="featured"
              label={t('featured')}
              defaultChecked={featured}
            />
            <SubmitButton text={t('submitUpdate')} className="w-fit" />
            </div>
          </FormContainer>
        </CardContent>
      </Card>
    </section>
  );
}
export default EditProductPage;
