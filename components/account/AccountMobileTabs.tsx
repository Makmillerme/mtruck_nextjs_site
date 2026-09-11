"use client";

import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { accountCabinetNav } from "@/utils/links";
import { useTranslations } from "next-intl";

function isActive(pathname: string, href: string, match: "exact" | "prefix") {
  if (match === "exact") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AccountMobileTabs() {
  const t = useTranslations("AccountCabinet");
  const pathname = usePathname();
  const router = useRouter();
  const active =
    accountCabinetNav.find((item) =>
      isActive(pathname, item.href, item.match)
    )?.key ?? "orders";

  return (
    <Tabs
      value={active}
      activationMode="manual"
      onValueChange={(key) => {
        const item = accountCabinetNav.find((entry) => entry.key === key);
        if (item && item.href !== pathname) router.push(item.href);
      }}
    >
      <TabsList className="w-full sm:w-full" aria-label={t("navLabel")}>
        {accountCabinetNav.map((item) => (
          <TabsTrigger
            key={item.key}
            value={item.key}
            asChild
            className="sm:flex-1"
          >
            <Link href={item.href}>{t(item.key)}</Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
