import { CardSignInButton } from '../form/Buttons';
import { fetchFavoriteId } from '@/utils/actions';
import FavoriteToggleForm from './FavoriteToggleForm';
import { getSession } from '@/utils/session';

async function FavoriteToggleButton({ productId }: { productId: string }) {
  const session = await getSession();
  const userId = session?.user.id;
  if (!userId) return <CardSignInButton />;
  const favoriteId = await fetchFavoriteId({ productId });

  return <FavoriteToggleForm favoriteId={favoriteId} productId={productId} />;
}
export default FavoriteToggleButton;
