import { SubmitButton } from '@/components/form/Buttons';
import CheckboxInput from '@/components/form/CheckboxInput';
import FormContainer from '@/components/form/FormContainer';
import FormInput from '@/components/form/FormInput';
import ImageInput from '@/components/form/ImageInput';
import PriceInput from '@/components/form/PriceInput';
import TextAreaInput from '@/components/form/TextAreaInput';
import { createProductAction } from '@/utils/actions';
import { faker } from '@faker-js/faker';
import { getTranslations } from 'next-intl/server';

async function CreateProductPage() {
  const t = await getTranslations('Admin');
  const name = faker.commerce.productName();
  const company = faker.company.name();
  const description = faker.lorem.paragraph({ min: 10, max: 12 });
  return (
    <section>
      <h1 className='text-2xl font-semibold mb-8'>{t('createProduct')}</h1>
      <div className='border p-8 rounded-md'>
        <FormContainer action={createProductAction}>
          <div className='grid gap-4 md:grid-cols-2 my-4'>
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
            <PriceInput />
            <ImageInput />
          </div>
          <TextAreaInput
            name='description'
            labelText={t('description')}
            defaultValue={description}
          />
          <div className='mt-6'>
            <CheckboxInput name='featured' label={t('featured')} />
          </div>
          <SubmitButton text={t('submitCreate')} className='mt-8' />
        </FormContainer>
      </div>
    </section>
  );
}
export default CreateProductPage;
