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
import { getTranslations } from 'next-intl/server';

async function EditProductPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const t = await getTranslations('Admin');
  const { id } = params;
  const product = await fetchAdminProductDetails(id);
  const { name, company, description, featured, price } = product;
  return (
    <section>
      <h1 className='text-2xl font-semibold mb-8'>{t('updateProduct')}</h1>
      <div className='border p-8 rounded'>
        <ImageInputContainer
          action={updateProductImageAction}
          name={name}
          image={product.image}
          text={t('updateImage')}
        >
          <input type='hidden' name='id' value={id} />
          <input type='hidden' name='url' value={product.image} />
        </ImageInputContainer>
        <FormContainer action={updateProductAction}>
          <div className='grid gap-4 md:grid-cols-2 my-4'>
            <input type='hidden' name='id' value={id} />
            <FormInput
              type='text'
              name='name'
              label={t('productName')}
              defaultValue={name}
            />
            <FormInput
              type='text'
              name='company'
              label={t('company')}
              defaultValue={company}
            />
            <PriceInput defaultValue={price} />
          </div>
          <TextAreaInput
            name='description'
            labelText={t('description')}
            defaultValue={description}
          />
          <div className='mt-6'>
            <CheckboxInput
              name='featured'
              label={t('featured')}
              defaultChecked={featured}
            />
          </div>
          <SubmitButton text={t('submitUpdate')} className='mt-8' />
        </FormContainer>
      </div>
    </section>
  );
}
export default EditProductPage;
