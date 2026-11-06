import type { AdminOrderRowDTO } from "@/lib/admin/order-row";
import type { AdminProductRowDTO } from "@/lib/admin/product-row";
import type { AdminUserRowDTO } from "@/lib/admin/user-row";

export type ActionState = {
  message: string;
  ok?: boolean;
  orderId?: string;
  /** Present after toggleFavoriteAction (null = removed). */
  favoriteId?: string | null;
  order?: AdminOrderRowDTO;
  product?: AdminProductRowDTO;
  user?: AdminUserRowDTO;
};

export type actionFunction = (
  prevState: ActionState,
  formData: FormData
) => Promise<ActionState>;
