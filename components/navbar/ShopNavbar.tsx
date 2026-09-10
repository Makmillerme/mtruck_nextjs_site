"use client";

import { useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isDarkUnderBar(headerH: number) {
  const bands = document.querySelectorAll("[data-header-surface='dark']");
  for (const el of bands) {
    const rect = el.getBoundingClientRect();
    if (rect.top < headerH + 8 && rect.bottom > 0) return true;
  }
  return false;
}

function readHeaderSurface(): "light" | "dark" {
  const header = document.querySelector(".site-header");
  const headerH = header?.getBoundingClientRect().height ?? 56;
  return isDarkUnderBar(headerH) ? "dark" : "light";
}

function useHeaderSurface() {
  const pathname = usePathname();
  const [surface, setSurface] = useState<"light" | "dark" | null>(null);
  const [seenPath, setSeenPath] = useState(pathname);

  if (seenPath !== pathname) {
    setSeenPath(pathname);
    setSurface(null);
  }

  useLayoutEffect(() => {
    const sync = () => {
      const next = readHeaderSurface();
      setSurface((prev) => (prev === next ? prev : next));
    };

    sync();
    const frame = window.requestAnimationFrame(sync);
    const main = document.querySelector("main");
    const observer = main ? new MutationObserver(sync) : null;
    observer?.observe(main as HTMLElement, {
      childList: true,
      subtree: true,
    });
    const stopObserver = window.setTimeout(() => observer?.disconnect(), 1500);
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(stopObserver);
      observer?.disconnect();
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [pathname]);

  return surface;
}

const headerIconClass =
  "size-9 shrink-0 text-foreground hover:bg-foreground/10 hover:text-foreground";
const headerControlClass =
  "text-foreground hover:bg-foreground/10 hover:text-foreground";

function navLinkClass(active: boolean) {
  return cn(
    "rounded-md px-3 py-2 text-sm font-medium tracking-wide text-foreground hover:bg-foreground/10 hover:text-foreground",
    active && "bg-foreground/10"
  );
}

function HeaderGlass({ surface }: { surface: "light" | "dark" | null }) {
  const [mounted, setMounted] = useState(false);
  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  const pane = (
    <div
      aria-hidden
      data-surface={surface ?? undefined}
      className="site-header-glass pointer-events-none fixed inset-x-0 top-0 z-40 h-14 backdrop-blur-2xl lg:h-16"
    />
  );

  if (!mounted) return pane;
  return createPortal(pane, document.body);
}

export default function ShopNavbar({
  user,
  isAdmin = false,
}: {
  user: SessionUser | null;
  isAdmin?: boolean;
}) {
  const t = useTranslations("Navbar");
  const pathname = usePathname();
  const phoneHref = t("phoneHref");
  const surface = useHeaderSurface();

  return (
    <>
      <div aria-hidden className="h-14 lg:h-16" />
      <HeaderGlass surface={surface} />
      <header
        data-surface={surface ?? undefined}
        suppressHydrationWarning
        className="site-header fixed inset-x-0 top-0 z-50 text-foreground"
      >
        <div className="page-container grid h-14 grid-cols-[1fr_auto] items-center gap-2 lg:h-16 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-3">
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
          <div className="flex min-w-0 shrink-0 items-center justify-end justify-self-end gap-0.5 sm:gap-1">
            <Button asChild variant="ghost" size="icon" className={headerIconClass}>
              <a href={phoneHref} aria-label={t("call")}>
                <LuPhone className="size-5" />
              </a>
            </Button>
            <FavoritesButton className={headerIconClass} />
            <LocaleSwitcher className={headerControlClass} />
            <LinksDropdown initialUser={user} isAdmin={isAdmin} />
          </div>
        </div>
      </header>
    </>
  );
}
