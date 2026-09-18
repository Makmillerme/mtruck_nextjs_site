import AdminArchiveView from "@/components/admin/archive/admin-archive-view";
import {
  fetchArchivedAdminOrders,
  fetchArchivedAdminProducts,
  fetchArchivedAdminUsers,
} from "@/utils/actions";
import { getLocale } from "next-intl/server";
import { getStaffUser, isAdminRole } from "@/utils/session";

function archiveTab(
  value?: string
): "sales" | "products" | "users" {
  if (value === "products" || value === "users") return value;
  return "sales";
}

async function AdminArchivePage(props: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const searchParams = await props.searchParams;
  const locale = await getLocale();
  const { user, role } = await getStaffUser();
  const tab = archiveTab(searchParams.tab);
  const [orders, products, users] = await Promise.all([
    fetchArchivedAdminOrders(),
    fetchArchivedAdminProducts(),
    fetchArchivedAdminUsers(),
  ]);

  return (
    <AdminArchiveView
      locale={locale}
      tab={tab}
      currentUserId={user.id}
      canDelete={isAdminRole(role)}
      users={users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        userCode: user.userCode,
        role: user.role,
        archivedAt: user.archivedAt?.toISOString() ?? null,
        productCount: user._count.products,
        orderCount: user._count.orders,
      }))}
      products={products.map((item) => ({
        id: item.id,
        name: item.name,
        company: item.company,
        price: item.price,
        productCode: item.productCode,
        status: item.status,
        archivedAt: item.archivedAt?.toISOString() ?? null,
      }))}
      orders={orders.map((order) => ({
        id: order.id,
        email: order.email,
        userName: order.user.name,
        productName: order.product?.name ?? null,
        orderTotal: order.orderTotal,
        archivedAt: order.archivedAt?.toISOString() ?? null,
      }))}
    />
  );
}

export default AdminArchivePage;
