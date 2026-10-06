import AccountCabinetView, {
  type AccountCabinetTab,
  type AccountFavoriteRow,
  type AccountSettingsProps,
} from "@/components/account/AccountCabinetView";
import type { AccountOrderRow } from "@/components/account/account-orders-view";
import { fetchTaxonomyTree } from "@/lib/catalog/taxonomy";
import type { TaxonomyTreeNode } from "@/lib/catalog/types";
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

function mapOrders(
  orders: Awaited<ReturnType<typeof fetchUserOrders>>
): AccountOrderRow[] {
  return orders.map((order) => ({
    id: order.id,
    kind: order.kind,
    status: order.status,
    origin: order.origin,
    productId: order.productId,
    productName: order.product?.name ?? null,
    taxonomyNodeId: order.taxonomyNodeId,
    taxonomyNodeName: order.taxonomyNode?.name ?? null,
    note: order.note,
    orderTotal: order.orderTotal,
    createdAt: order.createdAt.toISOString(),
  }));
}

function mapFavorites(
  favorites: Awaited<ReturnType<typeof fetchUserFavorites>>
): AccountFavoriteRow[] {
  return favorites.map((favorite) => ({
    id: favorite.id,
    product: {
      id: favorite.product.id,
      name: favorite.product.name,
      image: favorite.product.image,
      price: favorite.product.price,
      createdAt: favorite.product.createdAt.toISOString(),
      status: favorite.product.status,
      taxonomyNode: favorite.product.taxonomyNode,
      specs: favorite.product.specs,
      images: favorite.product.images,
    },
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
  const editId = searchParams.edit?.trim() || undefined;

  let orders: AccountOrderRow[] = [];
  let favorites: AccountFavoriteRow[] = [];
  let tree: TaxonomyTreeNode[] = [];
  let settings: AccountSettingsProps | null = null;

  if (tab === "favorites") {
    favorites = mapFavorites(await fetchUserFavorites());
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
    const [rawOrders, taxonomy] = await Promise.all([
      fetchUserOrders(),
      fetchTaxonomyTree(),
    ]);
    orders = mapOrders(rawOrders);
    tree = taxonomy;
  }

  const editExists = editId
    ? orders.some((order) => order.id === editId)
    : false;

  return (
    <AccountCabinetView
      tab={tab}
      locale={locale}
      createOpen={createOpen}
      editId={editExists ? editId : undefined}
      tree={tree}
      orders={orders}
      favorites={favorites}
      settings={settings}
    />
  );
}
