import { CardSignInButton } from '../form/Buttons';
import { fetchFavoriteId } from '@/utils/actions';
import FavoriteToggleForm from './FavoriteToggleForm';
import { getSession } from '@/utils/session';

async function FavoriteToggleButton({
  productId,
  className,
  favoriteId: favoriteIdProp,
  isAuthenticated: isAuthenticatedProp,
  appearance = "card",
}: {
  productId: string;
  className?: string;
  favoriteId?: string | null;
  isAuthenticated?: boolean;
  appearance?: "card" | "outline";
}) {
  let isAuthenticated = isAuthenticatedProp;
  let favoriteId = favoriteIdProp ?? null;

  if (isAuthenticated === undefined) {
    const session = await getSession();
    isAuthenticated = Boolean(session?.user.id);
    if (isAuthenticated) {
      favoriteId = await fetchFavoriteId({ productId });
    }
  }

  if (!isAuthenticated) {
    return <CardSignInButton className={className} appearance={appearance} />;
  }

  return (
    <FavoriteToggleForm
      favoriteId={favoriteId}
      productId={productId}
      className={className}
      appearance={appearance}
    />
  );
}
export default FavoriteToggleButton;
