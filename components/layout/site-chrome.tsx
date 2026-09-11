"use client";

import { usePathname } from "@/i18n/navigation";
import type { ReactNode } from "react";

function isAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export default function SiteChrome({
  header,
  footer,
  children,
}: {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const hideFooter = isAdminPath(pathname);

  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      {header}
      <main className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</main>
      {hideFooter ? null : footer}
    </div>
  );
}
