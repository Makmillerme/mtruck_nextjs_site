export const ADMIN_PAGE_SIZES = [25, 50, 75] as const;
export type AdminPageSize = (typeof ADMIN_PAGE_SIZES)[number];
export const ADMIN_DEFAULT_PAGE_SIZE: AdminPageSize = 25;

export const ADMIN_LIST_PAGE_KEY = "page";
export const ADMIN_LIST_PAGE_SIZE_KEY = "pageSize";

export function parseAdminPageSize(
  raw: string | null | undefined
): AdminPageSize {
  const n = Number(raw);
  return (ADMIN_PAGE_SIZES as readonly number[]).includes(n)
    ? (n as AdminPageSize)
    : ADMIN_DEFAULT_PAGE_SIZE;
}

export function parseAdminPage(raw: string | null | undefined): number {
  const n = Number(raw);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

export function adminPageCount(total: number, pageSize: number): number {
  if (total <= 0) return 1;
  return Math.max(1, Math.ceil(total / pageSize));
}

export function clampAdminPage(page: number, pageCount: number): number {
  return Math.min(Math.max(1, page || 1), Math.max(1, pageCount));
}

export function sliceAdminPage<T>(
  items: readonly T[],
  page: number,
  pageSize: number
): T[] {
  const safePage = Math.max(1, page);
  const start = (safePage - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

/** Omit defaults from URL (page=1, pageSize=25). */
export function adminPaginationParams(
  page: number,
  pageSize: AdminPageSize
): Record<string, string | undefined> {
  return {
    [ADMIN_LIST_PAGE_KEY]: page > 1 ? String(page) : undefined,
    [ADMIN_LIST_PAGE_SIZE_KEY]:
      pageSize !== ADMIN_DEFAULT_PAGE_SIZE ? String(pageSize) : undefined,
  };
}

export const ADMIN_LIST_PAGINATION_KEYS = [
  ADMIN_LIST_PAGE_KEY,
  ADMIN_LIST_PAGE_SIZE_KEY,
] as const;
