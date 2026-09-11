"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

const PAGE_KEYS = {
  "/account/orders": "orders",
  "/account/favorites": "favorites",
  "/account/settings": "settings",
} as const;

type PageKey = (typeof PAGE_KEYS)[keyof typeof PAGE_KEYS];

function resolvePageKey(pathname: string): PageKey {
  if (pathname in PAGE_KEYS) {
    return PAGE_KEYS[pathname as keyof typeof PAGE_KEYS];
  }
  if (pathname.startsWith("/account/favorites")) return "favorites";
  if (pathname.startsWith("/account/settings")) return "settings";
  return "orders";
}

export default function AccountBreadcrumbs() {
  const t = useTranslations("AccountCabinet");
  const pathname = usePathname();
  const pageKey = resolvePageKey(pathname);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">{t("home")}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/account/orders">{t("title")}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{t(pageKey)}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
