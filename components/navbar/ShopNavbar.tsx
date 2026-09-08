"use client";

import FavoritesButton from "@/components/navbar/FavoritesButton";
import LinksDropdown from "@/components/navbar/LinksDropdown";
import LocaleSwitcher from "@/components/navbar/LocaleSwitcher";
import Logo from "@/components/navbar/Logo";
import { Button } from "@/components/ui/button";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { siteNav } from "@/utils/links";
import type { SessionUser } from "@/utils/session";
import { useTranslations } from "next-intl";
import { LuPhone } from "react-icons/lu";

function isNavActive(href: string, pathname: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function navLinkClass(active: boolean) {
  return cn(
    "whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors",
    active
      ? "bg-primary/10 text-primary"
      : "text-muted-foreground hover:bg-muted hover:text-foreground"
  );
}

export default function ShopNavbar({
  user,
}: {
  user: SessionUser | null;
}) {
  const t = useTranslations("Navbar");
  const pathname = usePathname();
  const phoneHref = t("phoneHref");

  return (
    <header className="site-header sticky top-0 z-50 border-b border-border/50 bg-white/80 backdrop-blur-xl">
      <div className="page-container grid h-16 grid-cols-[1fr_auto] items-center gap-2 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-3">
        <div className="min-w-0 justify-self-start">
          <Logo />
        </div>
        <nav className="hidden items-center gap-1 lg:flex">
          {siteNav.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              prefetch
              className={navLinkClass(isNavActive(item.href, pathname))}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>
        <div className="flex min-w-0 shrink-0 items-center justify-end justify-self-end gap-0.5 sm:gap-1 lg:gap-2">
          <Button asChild variant="ghost" size="icon" className="size-9 shrink-0">
            <a href={phoneHref} aria-label={t("call")}>
              <LuPhone className="size-5" />
            </a>
          </Button>
          <FavoritesButton />
          <LocaleSwitcher />
          <LinksDropdown initialUser={user} />
        </div>
      </div>
    </header>
  );
}
