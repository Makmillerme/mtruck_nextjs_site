/** Client-safe role helpers (no next/headers). */

export function isAdminRole(role: string | null | undefined) {
  return role === "ADMIN";
}

export function isStaffRole(role: string | null | undefined) {
  return role === "ADMIN" || role === "MANAGER";
}

/** Admin accounts and self-archive/delete for staff are forbidden in admin UI. */
export function canMutateUserArchive(
  user: { id: string; role: string | null | undefined },
  currentUserId: string
) {
  if (user.role === "ADMIN") return false;
  if (user.id === currentUserId && isStaffRole(user.role)) return false;
  return true;
}
