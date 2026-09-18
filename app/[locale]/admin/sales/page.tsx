import AdminSalesView from "@/components/admin/sales/admin-sales-view";
import {
  fetchAdminOrderFormOptions,
  fetchAdminOrders,
} from "@/utils/actions";
import { getLocale } from "next-intl/server";
import { getStaffUser, isAdminRole } from "@/utils/session";

async function SalesPage(props: {
  searchParams: Promise<{ create?: string; edit?: string; userId?: string }>;
}) {
  const searchParams = await props.searchParams;
  const locale = await getLocale();
  const { role } = await getStaffUser();
  const [orders, options] = await Promise.all([
    fetchAdminOrders(),
    fetchAdminOrderFormOptions(),
  ]);
  const createOpen = searchParams.create === "1";
  const editId = searchParams.edit?.trim() || undefined;
  const editExists = editId
    ? orders.some((order) => order.id === editId)
    : false;
  const preselectedUserId = searchParams.userId?.trim() || undefined;
  const preselectedExists = preselectedUserId
    ? options.users.some((user) => user.id === preselectedUserId)
    : false;

  return (
    <AdminSalesView
      locale={locale}
      createOpen={createOpen}
      editId={editExists ? editId : undefined}
      preselectedUserId={preselectedExists ? preselectedUserId : undefined}
      canDelete={isAdminRole(role)}
      users={options.users}
      products={options.products}
      items={orders.map((order) => ({
        id: order.id,
        email: order.email,
        userId: order.userId,
        userName: order.user.name,
        kind: order.kind,
        status: order.status,
        productId: order.productId,
        productName: order.product?.name ?? null,
        products: order.products,
        orderTotal: order.orderTotal,
        tax: order.tax,
        shipping: order.shipping,
        isPaid: order.isPaid,
        createdAt: order.createdAt.toISOString(),
      }))}
    />
  );
}

export default SalesPage;
