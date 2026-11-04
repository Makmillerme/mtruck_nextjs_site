import AccountCabinetView, {
  type AccountCabinetTab,
  type AccountFavoriteRow,
  type AccountSettingsProps,
} from "@/components/account/AccountCabinetView";
import type { AccountOrderRow } from "@/components/account/account-orders-view";
import { fetchCardPreviewLayoutsByNodeIds } from "@/lib/catalog/card-preview";
import { productWithSpecsToVehicle } from "@/lib/catalog/product-to-vehicle";
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
    productImage: order.product?.image ?? null,
    productCode: order.product?.productCode ?? null,
    favoriteId: order.favoriteId ?? null,
    taxonomyNodeId: order.taxonomyNodeId,
    taxonomyNodeName: order.taxonomyNode?.name ?? null,
    note: order.note,
    orderTotal: order.orderTotal,
    createdAt: order.createdAt.toISOString(),
  }));
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
    vehicle: productWithSpecsToVehicle(
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
  const editId = searchParams.edit?.trim() || undefined;

  let orders: AccountOrderRow[] = [];
  let favorites: AccountFavoriteRow[] = [];
  let tree: TaxonomyTreeNode[] = [];
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
