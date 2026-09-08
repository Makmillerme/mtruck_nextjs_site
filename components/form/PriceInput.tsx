'use client';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { useTranslations } from 'next-intl';

const name = 'price';

type FormInputNumberProps = {
  defaultValue?: number;
};

function PriceInput({ defaultValue }: FormInputNumberProps) {
  const t = useTranslations('Admin');
  return (
    <div className='mb-2'>
      <Label htmlFor={name}>{t('price')}</Label>
      <Input
        id={name}
        type='number'
        name={name}
        min={0}
        defaultValue={defaultValue || 100}
        required
      />
    </div>
  );
}
export default PriceInput;
