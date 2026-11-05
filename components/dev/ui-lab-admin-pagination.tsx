"use client";

import { useMemo, useState } from "react";
import AdminTablePagination from "@/components/admin/admin-table-pagination";
import {
  ADMIN_DEFAULT_PAGE_SIZE,
  adminPageCount,
  sliceAdminPage,
  type AdminPageSize,
} from "@/lib/admin/list-pagination";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const DEMO_ROWS = Array.from({ length: 80 }, (_, i) => ({
  id: `row-${i + 1}`,
  name: `Demo item ${i + 1}`,
  code: String(1000 + i),
}));

export default function UiLabAdminPaginationDemo() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<AdminPageSize>(ADMIN_DEFAULT_PAGE_SIZE);
  const pageCount = adminPageCount(DEMO_ROWS.length, pageSize);
  const paged = useMemo(
    () => sliceAdminPage(DEMO_ROWS, page, pageSize),
    [page, pageSize]
  );

  return (
    <div className="grid max-w-3xl gap-3">
      <p className="max-w-2xl text-sm text-muted-foreground">
        Канон пагінації адмін-таблиць: стрілки outline + «сторінка / усього» + DropdownMenu
        pageSize 25 / 50 / 75 (default 25). Той самий компонент у Products / Users / Sales /
        Inquiries / Archive.
      </p>
      <p className="text-sm text-muted-foreground">
        Усього: {DEMO_ROWS.length}
      </p>
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Назва</TableHead>
                <TableHead>Код</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.code}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AdminTablePagination
        page={page}
        pageCount={pageCount}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />
    </div>
  );
}
