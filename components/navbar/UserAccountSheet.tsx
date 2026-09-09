"use client";

import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { accountNav, siteNav } from "@/utils/links";
import { signOutAndRefresh } from "@/lib/sign-out";
import type { SessionUser } from "@/utils/session";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { LuLogOut, LuMenu, LuSettings } from "react-icons/lu";
import { isClientAdmin, UserAvatar } from "./AccountTrigger";

function sheetLinkClass(active: boolean) {
  return cn(
    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
    active
      ? "bg-primary/10 text-primary"
      : "text-foreground hover:bg-muted"
  );
}

export default function UserAccountSheet({
  user,
}: {
  user: SessionUser | null;
}) {
  const t = useTranslations("Navbar");
  const tLinks = useTranslations("NavLinks");
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isAdmin = isClientAdmin(user?.email);

  async function handleSignOut() {
    setOpen(false);
    await signOutAndRefresh(router);
  }

  function close() {
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-9 shrink-0 text-foreground hover:bg-foreground/10 hover:text-foreground"
          aria-label={t("menu")}
        >
          <LuMenu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-80 flex-col gap-4 overflow-y-auto sm:max-w-80"
      >
        <SheetHeader className="text-left">
          <SheetTitle className="sr-only">{t("account")}</SheetTitle>
          {user ? (
            <div className="flex items-center gap-3">
              <UserAvatar user={user} />
              <div className="min-w-0">
                <p className="font-semibold text-foreground">{user.name}</p>
                <p className="truncate text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
          ) : (
            <p className="font-semibold">{t("account")}</p>
          )}
        </SheetHeader>

        <nav className="flex flex-col">
          {siteNav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={sheetLinkClass(active)}
                onClick={close}
              >
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        {user ? (
          <>
            <Separator />
            <nav className="flex flex-col">
              {accountNav.map((item) => {
                if (item.href === "/admin/sales" && !isAdmin) return null;
                const active =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={sheetLinkClass(active)}
                    onClick={close}
                  >
                    {tLinks(item.key)}
                  </Link>
                );
              })}
            </nav>
          </>
        ) : (
          <>
            <Separator />
            <div className="flex flex-col gap-2">
              <Button asChild>
                <Link href="/sign-in" onClick={close}>
                  {t("login")}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/sign-up" onClick={close}>
                  {t("register")}
                </Link>
              </Button>
            </div>
          </>
        )}

        {user ? (
          <>
            <Separator />
            <nav className="flex flex-col gap-1">
              <Link
                href="/account"
                className={cn(sheetLinkClass(false), "inline-flex items-center")}
                onClick={close}
              >
                <LuSettings className="mr-2 size-4" />
                {t("manageAccount")}
              </Link>
              <button
                type="button"
                className={cn(sheetLinkClass(false), "inline-flex items-center text-left")}
                onClick={handleSignOut}
              >
                <LuLogOut className="mr-2 size-4" />
                {t("signOut")}
              </button>
            </nav>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
