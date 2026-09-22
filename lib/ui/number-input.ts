import { cn } from "@/lib/utils";
import type { WheelEvent } from "react";

/** Hide native number spinners; match PriceInput / sheet number fields. */
export const numberInputClassName = cn(
  "[appearance:textfield]",
  "[&::-webkit-outer-spin-button]:appearance-none",
  "[&::-webkit-inner-spin-button]:appearance-none"
);

/** Prevent mouse-wheel from changing the value while focused. */
export function blurNumberInputOnWheel(
  event: WheelEvent<HTMLInputElement>
) {
  event.currentTarget.blur();
}
