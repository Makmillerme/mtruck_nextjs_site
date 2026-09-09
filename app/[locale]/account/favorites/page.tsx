import AccountEmptyState from "@/components/account/AccountEmptyState";
import ProductsGrid from "@/components/products/ProductsGrid";
import { fetchUserFavorites } from "@/utils/actions";
import { getTranslations } from "next-intl/server";
import { LuHeart } from "react-icons/lu";

export default async function AccountFavoritesPage() {
  const t = await getTranslations("AccountCabinet");
  const favorites = await fetchUserFavorites();

  if (favorites.length === 0) {
    return (
      <AccountEmptyState
        icon={LuHeart}
        title={t("favoritesEmptyTitle")}
        description={t("favoritesEmptyDesc")}
        actionLabel={t("browseCatalog")}
      />
    );
  }

  const favoriteByProductId = new Map(
    favorites.map((favorite) => [favorite.productId, favorite.id])
  );

  return (
    <ProductsGrid
      products={favorites.map((favorite) => favorite.product)}
      favoriteByProductId={favoriteByProductId}
      isAuthenticated
      priorityCount={3}
    />
  );
}
