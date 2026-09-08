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
  "/account": "overview",
  "/account/orders": "orders",
  "/account/favorites": "favorites",
  "/account/settings": "settings",
} as const;

type PageKey = (typeof PAGE_KEYS)[keyof typeof PAGE_KEYS];

function resolvePageKey(pathname: string): PageKey {
  if (pathname in PAGE_KEYS) {
    return PAGE_KEYS[pathname as keyof typeof PAGE_KEYS];
  }
  if (pathname.startsWith("/account/orders")) return "orders";
  if (pathname.startsWith("/account/favorites")) return "favorites";
  if (pathname.startsWith("/account/settings")) return "settings";
  return "overview";
}

export default function AccountBreadcrumbs() {
  const t = useTranslations("AccountCabinet");
  const pathname = usePathname();
  const pageKey = resolvePageKey(pathname);
  const isOverview = pageKey === "overview";

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
          {isOverview ? (
            <BreadcrumbPage>{t("title")}</BreadcrumbPage>
          ) : (
            <BreadcrumbLink asChild>
              <Link href="/account">{t("title")}</Link>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {!isOverview ? (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t(pageKey)}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        ) : null}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
