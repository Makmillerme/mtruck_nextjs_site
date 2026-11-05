"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ADMIN_DEFAULT_PAGE_SIZE,
  ADMIN_LIST_PAGE_KEY,
  ADMIN_LIST_PAGE_SIZE_KEY,
  adminPageCount,
  adminPaginationParams,
  clampAdminPage,
  parseAdminPage,
  parseAdminPageSize,
  sliceAdminPage,
  type AdminPageSize,
} from "@/lib/admin/list-pagination";

/**
 * Client pagination after filters. Resets to page 1 when resetKey changes.
 * Caller merges `paginationParams` into syncAdminListUrl owned keys.
 */
export function useAdminTablePagination<T>(
  items: readonly T[],
  resetKey: string
) {
  const searchParams = useSearchParams();
  const [pageSize, setPageSizeState] = useState<AdminPageSize>(() =>
    parseAdminPageSize(searchParams.get(ADMIN_LIST_PAGE_SIZE_KEY))
  );
  const [page, setPageState] = useState(() =>
    parseAdminPage(searchParams.get(ADMIN_LIST_PAGE_KEY))
  );

  const pageCount = adminPageCount(items.length, pageSize);
  const safePage = clampAdminPage(page, pageCount);

  useEffect(() => {
    if (page !== safePage) setPageState(safePage);
  }, [page, safePage]);

  const prevResetKey = useRef(resetKey);
  useEffect(() => {
    if (prevResetKey.current === resetKey) return;
    prevResetKey.current = resetKey;
    setPageState(1);
  }, [resetKey]);

  const pagedItems = useMemo(
    () => sliceAdminPage(items, safePage, pageSize),
    [items, safePage, pageSize]
  );

  function setPage(next: number) {
    setPageState(clampAdminPage(next, pageCount));
  }

  function setPageSize(next: AdminPageSize) {
    setPageSizeState(next);
    setPageState(1);
  }

  return {
    page: safePage,
    pageSize,
    pageCount,
    pagedItems,
    setPage,
    setPageSize,
    paginationParams: adminPaginationParams(safePage, pageSize),
    showPagination: items.length > 0,
  };
}

export {
  ADMIN_DEFAULT_PAGE_SIZE,
  ADMIN_LIST_PAGE_KEY,
  ADMIN_LIST_PAGE_SIZE_KEY,
};
