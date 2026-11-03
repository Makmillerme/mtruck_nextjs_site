"use client";

import { useEffect } from "react";
import type { UiEditorTab } from "@/lib/admin/ui-editor-tab";

/**
 * Sync default folder into the URL without SoftNav / RSC redirect.
 * history.replaceState keeps the painted editor; no second navigation flash.
 */
export default function UiEditorUrlSync({
  tab,
  nodeId,
}: {
  tab: UiEditorTab;
  nodeId: string;
}) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (url.searchParams.get("node") === nodeId) return;
    url.searchParams.set("tab", tab);
    url.searchParams.set("node", nodeId);
    window.history.replaceState(window.history.state, "", url.toString());
  }, [tab, nodeId]);

  return null;
}
