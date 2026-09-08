"use client";

import { Link, usePathname } from "@/i18n/navigation";
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

export default function AccountMobileTabs() {
  const t = useTranslations("AccountCabinet");
  const pathname = usePathname();

  return (
    <nav
      aria-label={t("navLabel")}
      className="grid grid-cols-4 gap-2 lg:hidden"
    >
      {accountCabinetNav.map((item) => {
        const Icon = icons[item.key];
        const active = isActive(pathname, item.href, item.match);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border text-center transition-colors",
              active
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="size-5 shrink-0" />
            <span className="max-w-full truncate px-1 text-[11px] font-medium leading-tight">
              {t(item.key)}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
