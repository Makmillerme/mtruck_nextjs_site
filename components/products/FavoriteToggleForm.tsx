'use client';

import { usePathname } from '@/i18n/navigation';
import FormContainer from '../form/FormContainer';
import { toggleFavoriteAction } from '@/utils/actions';
import { CardSubmitButton } from '../form/Buttons';

type FavoriteToggleFormProps = {
  productId: string;
  favoriteId: string | null;
  className?: string;
  appearance?: "card" | "outline";
};

function FavoriteToggleForm({
  productId,
  favoriteId,
  className,
  appearance = "card",
}: FavoriteToggleFormProps) {
  const pathname = usePathname();
  const toggleAction = toggleFavoriteAction.bind(null, {
    productId,
    favoriteId,
    pathname,
  });
  return (
    <FormContainer action={toggleAction} className="contents">
      <CardSubmitButton
        isFavorite={favoriteId ? true : false}
        className={className}
        appearance={appearance}
      />
    </FormContainer>
  );
}
export default FavoriteToggleForm;
