"use client";

import CatalogPagination from "@/components/products/catalog-pagination";
import { useRouter } from "@/i18n/navigation";
import {
  buildCatalogHref,
  type CatalogPageSize,
} from "@/utils/catalog-query";

export default function CatalogPaginationClient({
  page,
  pageCount,
  pageSize,
  className,
}: {
  page: number;
  pageCount: number;
  pageSize: CatalogPageSize;
  className?: string;
}) {
  const router = useRouter();

  function go(patch: { page?: number; pageSize?: CatalogPageSize }) {
    const href = buildCatalogHref(
      new URLSearchParams(window.location.search),
      patch
    );
    router.replace(href, { scroll: false });
  }

  return (
    <CatalogPagination
      page={page}
      pageCount={pageCount}
      pageSize={pageSize}
      className={className}
      onPageChange={(next) => go({ page: next })}
      onPageSizeChange={(size) => go({ pageSize: size, page: 1 })}
    />
  );
}
