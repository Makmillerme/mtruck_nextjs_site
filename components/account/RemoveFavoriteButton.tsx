"use client";

import { ConfirmDeleteIcon } from "@/components/form/ConfirmDelete";
import { usePathname } from "@/i18n/navigation";
import { toggleFavoriteAction } from "@/utils/actions";
import type { actionFunction } from "@/utils/types";

export default function RemoveFavoriteButton({
  productId,
  favoriteId,
}: {
  productId: string;
  favoriteId: string;
}) {
  const pathname = usePathname();
  const action = toggleFavoriteAction.bind(null, {
    productId,
    favoriteId,
    pathname,
  }) as unknown as actionFunction;

  return <ConfirmDeleteIcon action={action} />;
}
