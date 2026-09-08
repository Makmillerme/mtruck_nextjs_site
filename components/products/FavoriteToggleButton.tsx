import { CardSignInButton } from '../form/Buttons';
import { fetchFavoriteId } from '@/utils/actions';
import FavoriteToggleForm from './FavoriteToggleForm';
import { getSession } from '@/utils/session';

async function FavoriteToggleButton({
  productId,
  className,
}: {
  productId: string;
  className?: string;
}) {
  const session = await getSession();
  const userId = session?.user.id;
  if (!userId) return <CardSignInButton className={className} />;
  const favoriteId = await fetchFavoriteId({ productId });

  return (
    <FavoriteToggleForm
      favoriteId={favoriteId}
      productId={productId}
      className={className}
    />
  );
}
export default FavoriteToggleButton;
