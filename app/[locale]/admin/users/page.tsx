import AdminUsersView, {
  type AdminUserRow,
} from "@/components/admin/users/admin-users-view";
import { fetchAdminUserById, fetchAdminUsers } from "@/utils/actions";
import { getLocale } from "next-intl/server";
import { getStaffUser, isAdminRole } from "@/utils/session";

function toRow(user: {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  userCode: string;
  role: AdminUserRow["role"];
  createdAt: Date;
  archivedAt: Date | null;
  _count: { products: number; orders: number };
}): AdminUserRow {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    userCode: user.userCode,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    archivedAt: user.archivedAt?.toISOString() ?? null,
    productCount: user._count.products,
    orderCount: user._count.orders,
  };
}

async function AdminUsersPage(props: {
  searchParams: Promise<{ create?: string; edit?: string }>;
}) {
  const searchParams = await props.searchParams;
  const locale = await getLocale();
  const { user, role } = await getStaffUser();
  const users = await fetchAdminUsers();
  const createOpen = searchParams.create === "1";
  const editId = searchParams.edit?.trim() || undefined;
  const inList = editId ? users.some((user) => user.id === editId) : false;
  const extra =
    editId && !inList ? await fetchAdminUserById(editId) : null;

  return (
    <AdminUsersView
      locale={locale}
      createOpen={createOpen}
      editId={inList || extra ? editId : undefined}
      editFallback={extra ? toRow(extra) : undefined}
      currentUserId={user.id}
      canManageRoles={isAdminRole(role)}
      canDelete={isAdminRole(role)}
      items={users.map(toRow)}
    />
  );
}

export default AdminUsersPage;
