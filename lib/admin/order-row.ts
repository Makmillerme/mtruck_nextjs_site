/** Shared admin order row (list + soft-save payload). */
export type AdminOrderRowDTO = {
  id: string;
  email: string;
  userId: string;
  userName: string;
  kind: "CATALOG" | "REQUEST";
  status: "NEW" | "IN_PROGRESS" | "CLOSED";
  productId: string | null;
  productName: string | null;
  folderName: string | null;
  products: number;
  orderTotal: number;
  tax: number;
  shipping: number;
  isPaid: boolean;
  createdAt: string;
};

export const adminOrderListInclude = {
  user: {
    select: { id: true, name: true, email: true },
  },
  product: {
    select: { id: true, name: true, price: true },
  },
  taxonomyNode: {
    select: { id: true, name: true },
  },
} as const;

export function mapAdminOrderRow(order: {
  id: string;
  email: string;
  userId: string;
  kind: "CATALOG" | "REQUEST";
  status: "NEW" | "IN_PROGRESS" | "CLOSED";
  productId: string | null;
  products: number;
  orderTotal: number;
  tax: number;
  shipping: number;
  isPaid: boolean;
  createdAt: Date;
  user: { id: string; name: string; email: string };
  product: { id: string; name: string; price: number } | null;
  taxonomyNode: { id: string; name: string } | null;
}): AdminOrderRowDTO {
  return {
    id: order.id,
    email: order.email,
    userId: order.userId,
    userName: order.user.name,
    kind: order.kind,
    status: order.status,
    productId: order.productId,
    productName: order.product?.name ?? null,
    folderName: order.taxonomyNode?.name ?? null,
    products: order.products,
    orderTotal: order.orderTotal,
    tax: order.tax,
    shipping: order.shipping,
    isPaid: order.isPaid,
    createdAt: order.createdAt.toISOString(),
  };
}
