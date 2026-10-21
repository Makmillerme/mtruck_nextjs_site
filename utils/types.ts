import type { AdminProductRowDTO } from "@/lib/admin/product-row";
import type { AdminUserRowDTO } from "@/lib/admin/user-row";

export type ActionState = {
  message: string;
  ok?: boolean;
  product?: AdminProductRowDTO;
  user?: AdminUserRowDTO;
};

export type actionFunction = (
  prevState: ActionState,
  formData: FormData
) => Promise<ActionState>;
