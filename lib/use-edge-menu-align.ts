"use client";

import { useCallback, useState } from "react";

export type MenuAlign = "start" | "end";

/**
 * Align dropdown to the viewport edge the trigger is closer to.
 * Call `onOpenChange` from DropdownMenu; pass `align` to DropdownMenuContent.
 */
export function useEdgeMenuAlign(defaultAlign: MenuAlign = "start") {
  const [align, setAlign] = useState<MenuAlign>(defaultAlign);

  const onOpenChange = useCallback((open: boolean, trigger: HTMLElement | null) => {
    if (!open || !trigger) return;
    const rect = trigger.getBoundingClientRect();
    const mid = rect.left + rect.width / 2;
    const viewportMid = window.innerWidth / 2;
    setAlign(mid >= viewportMid ? "end" : "start");
  }, []);

  return { align, onOpenChange, collisionPadding: 8 as const };
}
