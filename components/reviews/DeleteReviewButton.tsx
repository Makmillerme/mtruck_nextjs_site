"use client";

import { ConfirmDeleteIcon } from "@/components/form/ConfirmDelete";
import { deleteReviewAction } from "@/utils/actions";
import type { actionFunction } from "@/utils/types";

export default function DeleteReviewButton({ reviewId }: { reviewId: string }) {
  const deleteReview = deleteReviewAction.bind(null, {
    reviewId,
  }) as unknown as actionFunction;

  return <ConfirmDeleteIcon action={deleteReview} />;
}
