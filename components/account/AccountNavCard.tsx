"use client";

import { Link, usePathname } from "@/i18n/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { accountCabinetNav } from "@/utils/links";
import { useTranslations } from "next-intl";
import {
  LuHeart,
  LuLayoutDashboard,
  LuPackage,
  LuSettings,
} from "react-icons/lu";

const icons = {
  overview: LuLayoutDashboard,
  orders: LuPackage,
  favorites: LuHeart,
  settings: LuSettings,
} as const;

function isActive(pathname: string, href: string, match: "exact" | "prefix") {
  if (match === "exact") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AccountNavCard() {
  const t = useTranslations("AccountCabinet");
  const pathname = usePathname();

  return (
    <aside className="hidden min-w-0 lg:block">
      <Card className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">{t("navLabel")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {accountCabinetNav.map((item) => {
            const Icon = icons[item.key];
            const active = isActive(pathname, item.href, item.match);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span>{t(item.key)}</span>
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </aside>
  );
}
