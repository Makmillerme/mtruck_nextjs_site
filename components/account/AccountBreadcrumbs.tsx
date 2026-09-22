"use client";

import UserCodeChip from "@/components/account/UserCodeChip";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

type PageKey = "orders" | "favorites" | "settings";

function resolvePageKey(tab: string | null): PageKey {
  if (tab === "favorites" || tab === "settings") return tab;
  return "orders";
}

export default function AccountBreadcrumbs({
  userCode,
}: {
  userCode?: string | null;
}) {
  const t = useTranslations("AccountCabinet");
  const searchParams = useSearchParams();
  const pageKey = resolvePageKey(searchParams.get("tab"));

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
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
              <Link href="/account?tab=orders">{t("title")}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{t(pageKey)}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {userCode ? <UserCodeChip code={userCode} /> : null}
    </div>
  );
}
