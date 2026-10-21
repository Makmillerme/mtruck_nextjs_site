import AdminUsersView from "@/components/admin/users/admin-users-view";
import { mapAdminUserRow } from "@/lib/admin/user-row";
import { fetchAdminUserById, fetchAdminUsers } from "@/utils/actions";
import { getLocale } from "next-intl/server";
import { getStaffUser, isAdminRole } from "@/utils/session";

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
      editFallback={extra ? mapAdminUserRow(extra) : undefined}
      currentUserId={user.id}
      canManageRoles={isAdminRole(role)}
      canDelete={isAdminRole(role)}
      items={users.map(mapAdminUserRow)}
    />
  );
}

export default AdminUsersPage;
