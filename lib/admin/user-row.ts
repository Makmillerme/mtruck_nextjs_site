/** Shared admin user row (list + soft-save payload). */
export type AdminUserRowDTO = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  userCode: string;
  role: "USER" | "ADMIN" | "MANAGER";
  createdAt: string;
  productCount: number;
  orderCount: number;
  archivedAt?: string | null;
};

export const adminUserListSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  userCode: true,
  role: true,
  createdAt: true,
  archivedAt: true,
  _count: { select: { products: true, orders: true } },
} as const;

export function mapAdminUserRow(user: {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  userCode: string;
  role: "USER" | "ADMIN" | "MANAGER";
  createdAt: Date;
  archivedAt: Date | null;
  _count: { products: number; orders: number };
}): AdminUserRowDTO {
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
