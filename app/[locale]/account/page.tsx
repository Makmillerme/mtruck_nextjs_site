import AccountCabinetView, {
  type AccountCabinetTab,
} from "@/components/account/AccountCabinetView";
import { fetchTaxonomyTree } from "@/lib/catalog/taxonomy";
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

export default async function AccountPage(props: {
  searchParams: Promise<{ tab?: string; create?: string; edit?: string }>;
}) {
  const searchParams = await props.searchParams;
  const locale = await getLocale();
  const user = await getAuthUser();
  const tab = parseTab(searchParams.tab);
  const createOpen = searchParams.create === "1";
  const editId = searchParams.edit?.trim() || undefined;

  const [orders, favorites, tree, canChangePassword, profile] =
    await Promise.all([
      fetchUserOrders(),
      fetchUserFavorites(),
      fetchTaxonomyTree(),
      userHasCredentialAccount(),
      db.user.findUnique({
        where: { id: user.id },
        select: { phone: true },
      }),
    ]);

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
        orders={orders.map((order) => ({
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
        }))}
        favorites={favorites.map((favorite) => ({
          id: favorite.id,
          product: {
            id: favorite.product.id,
            name: favorite.product.name,
            price: favorite.product.price,
            status: favorite.product.status,
          },
        }))}
        settings={{
          name: user.name,
          email: user.email,
          image: user.image ?? null,
          phone: profile?.phone ?? null,
          canChangePassword,
        }}
      />
  );
}
