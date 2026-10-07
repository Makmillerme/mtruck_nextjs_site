"use client";

import { useCallback, type ForwardedRef } from "react";

function stop(event: Event) {
  event.stopPropagation();
}

function assignRef<T>(ref: ForwardedRef<T>, node: T | null) {
  if (typeof ref === "function") ref(node);
  else if (ref) ref.current = node;
}

/**
 * Non-modal floating layers (Popover / DropdownMenu with `modal={false}`) are
 * portaled to `<body>`, outside an open Sheet/Dialog. The dialog's
 * react-remove-scroll lock listens for `wheel`/`touchmove` on `document` and
 * cancels them for anything outside its content, so lists inside the layer
 * cannot scroll. Stopping propagation at the layer keeps the event away from
 * that lock while native scrolling still happens.
 */
export function useFloatingScrollRef<T extends HTMLElement>(
  forwardedRef: ForwardedRef<T>
) {
  return useCallback(
    (node: T | null) => {
      assignRef(forwardedRef, node);
      if (!node) return;
      node.addEventListener("wheel", stop, { passive: true });
      node.addEventListener("touchmove", stop, { passive: true });
      return () => {
        node.removeEventListener("wheel", stop);
        node.removeEventListener("touchmove", stop);
        assignRef(forwardedRef, null);
      };
    },
    [forwardedRef]
  );
}
