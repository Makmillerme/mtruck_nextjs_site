import AccountOrdersView from "@/components/account/account-orders-view";
import { fetchTaxonomyTree } from "@/lib/catalog/taxonomy";
import { fetchUserOrders } from "@/utils/actions";
import { getLocale } from "next-intl/server";

export default async function AccountOrdersPage(props: {
  searchParams: Promise<{ create?: string; edit?: string }>;
}) {
  const searchParams = await props.searchParams;
  const locale = await getLocale();
  const [orders, tree] = await Promise.all([
    fetchUserOrders(),
    fetchTaxonomyTree(),
  ]);
  const createOpen = searchParams.create === "1";
  const editId = searchParams.edit?.trim() || undefined;
  const editExists = editId
    ? orders.some((order) => order.id === editId)
    : false;

  return (
    <AccountOrdersView
      locale={locale}
      createOpen={createOpen}
      editId={editExists ? editId : undefined}
      tree={tree}
      items={orders.map((order) => ({
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
    />
  );
}
