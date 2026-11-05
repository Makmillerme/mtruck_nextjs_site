import AccountCabinetView, {
  type AccountCabinetTab,
  type AccountFavoriteRow,
  type AccountSettingsProps,
} from "@/components/account/AccountCabinetView";
import type { AccountOrderRow } from "@/components/account/account-orders-view";
import { fetchCardPreviewLayoutsByNodeIds } from "@/lib/catalog/card-preview";
import { productWithSpecsToCardModel } from "@/lib/catalog/product-to-card";
import { resolveProductsAreUniqueByNodeIds } from "@/lib/catalog/taxonomy";
import {
  fetchUserFavorites,
  fetchUserOrders,
  userHasCredentialAccount,
} from "@/utils/actions";
import db from "@/utils/db";
import { getAuthUser } from "@/utils/session";
import { getLocale } from "next-intl/server";

function parseTab(value?: string): AccountCabinetTab {
  if (value === "favorites" || value === "settings") return value;
  return "orders";
}

async function mapOrders(
  orders: Awaited<ReturnType<typeof fetchUserOrders>>
): Promise<AccountOrderRow[]> {
  const nodeIds = orders
    .map((order) => order.product?.taxonomyNodeId)
    .filter((id): id is string => Boolean(id));
  const uniqueByNode = await resolveProductsAreUniqueByNodeIds(nodeIds);

  return orders.map((order) => {
    const folderId = order.product?.taxonomyNodeId ?? null;
    const productsAreUnique = folderId
      ? Boolean(uniqueByNode.get(folderId))
      : false;
    const allowsQuantity =
      order.kind === "CATALOG" &&
      Boolean(order.productId) &&
      !productsAreUnique &&
      (order.status === "NEW" || order.status === "IN_PROGRESS");

    return {
      id: order.id,
      kind: order.kind,
      status: order.status,
      origin: order.origin,
      productId: order.productId,
      productName: order.product?.name ?? null,
      productImage: order.product?.image ?? null,
      productCode: order.product?.productCode ?? null,
      favoriteId: order.favoriteId ?? null,
      taxonomyNodeId: order.taxonomyNodeId ?? folderId,
      taxonomyNodeName: order.taxonomyNode?.name ?? null,
      note: order.note,
      orderTotal: order.orderTotal,
      quantity: order.products,
      allowsQuantity,
      createdAt: order.createdAt.toISOString(),
    };
  });
}

async function mapFavorites(
  favorites: Awaited<ReturnType<typeof fetchUserFavorites>>,
  locale: string
): Promise<AccountFavoriteRow[]> {
  const nodeIds = favorites
    .map((favorite) => favorite.product.taxonomyNodeId)
    .filter((id): id is string => Boolean(id));
  const layouts = await fetchCardPreviewLayoutsByNodeIds(db, nodeIds);

  return favorites.map((favorite) => ({
    id: favorite.id,
    productId: favorite.product.id,
    product: productWithSpecsToCardModel(
      favorite.product,
      favorite.product.taxonomyNodeId
        ? layouts.get(favorite.product.taxonomyNodeId)
        : undefined,
      locale
    ),
  }));
}

export default async function AccountPage(props: {
  searchParams: Promise<{ tab?: string; create?: string; edit?: string }>;
}) {
  const searchParams = await props.searchParams;
  const locale = await getLocale();
  const user = await getAuthUser();
  const tab = parseTab(searchParams.tab);
  const createOpen = searchParams.create === "1";

  let orders: AccountOrderRow[] = [];
  let favorites: AccountFavoriteRow[] = [];
  let settings: AccountSettingsProps | null = null;

  if (tab === "favorites") {
    favorites = await mapFavorites(await fetchUserFavorites(), locale);
  } else if (tab === "settings") {
    const [canChangePassword, profile] = await Promise.all([
      userHasCredentialAccount(),
      db.user.findUnique({
        where: { id: user.id },
        select: { phone: true },
      }),
    ]);
    settings = {
      name: user.name,
      email: user.email,
      image: user.image ?? null,
      phone: profile?.phone ?? null,
      canChangePassword,
    };
  } else {
    orders = await mapOrders(await fetchUserOrders());
  }

  return (
    <AccountCabinetView
      tab={tab}
      locale={locale}
      createOpen={createOpen}
      orders={orders}
      favorites={favorites}
      settings={settings}
    />
  );
}
