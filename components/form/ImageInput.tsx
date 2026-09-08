'use client';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { useTranslations } from 'next-intl';

function ImageInput() {
  const t = useTranslations('Admin');
  const name = 'image';

  return (
    <div className='mb-2'>
      <Label htmlFor={name}>{t('image')}</Label>
      <Input id={name} name={name} type='file' required accept='image/*' />
    </div>
  );
}
export default ImageInput;
