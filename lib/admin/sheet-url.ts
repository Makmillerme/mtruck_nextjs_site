/** Sync admin list sheet query (?create / ?edit / optional extras) without navigation. */
const SHEET_TRANSIENT_KEYS = ["create", "edit", "node", "userId"] as const;

export function syncAdminSheetUrl(next: {
  create?: boolean;
  edit?: string;
  node?: string | null;
  userId?: string | null;
}) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  const root = url.searchParams.get("root");
  for (const key of SHEET_TRANSIENT_KEYS) {
    url.searchParams.delete(key);
  }
  if (next.create) url.searchParams.set("create", "1");
  if (next.edit) url.searchParams.set("edit", next.edit);
  if (next.node) url.searchParams.set("node", next.node);
  if (next.userId) url.searchParams.set("userId", next.userId);
  if (root) url.searchParams.set("root", root);
  window.history.replaceState(null, "", url.toString());
}
