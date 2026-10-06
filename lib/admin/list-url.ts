/**
 * Replace list-owned query keys (filters / search) in place, keeping sheet
 * keys (?create / ?edit / ?node / ?userId / ?root) untouched.
 */
export function syncAdminListUrl(
  ownedKeys: readonly string[],
  next: Record<string, string | null | undefined>,
  isOwned?: (key: string) => boolean
) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  for (const key of [...url.searchParams.keys()]) {
    if (ownedKeys.includes(key) || isOwned?.(key)) {
      url.searchParams.delete(key);
    }
  }
  for (const [key, value] of Object.entries(next)) {
    if (value) url.searchParams.set(key, value);
  }
  if (url.toString() === window.location.href) return;
  window.history.replaceState(null, "", url.toString());
}

export const ADMIN_LIST_SEARCH_KEY = "q";
