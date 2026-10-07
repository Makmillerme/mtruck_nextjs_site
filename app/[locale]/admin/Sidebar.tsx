"use client";

import { type MouseEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { LuChevronDown } from "react-icons/lu";
import { adminLinks } from "@/utils/links";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useSoftNavOptional } from "@/components/soft-nav/soft-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type AdminProductRootLink = {
  id: string;
  name: string;
};

function isActive(pathname: string, href: string) {
  if (pathname === href) return true;
  if (href === "/admin/products") {
    return pathname === "/admin/products" || pathname.startsWith("/admin/products/");
  }
  if (href === "/admin/archive") {
    return pathname.startsWith("/admin/archive");
  }
  return false;
}

function isCmsSection(pathname: string) {
  return (
    pathname === "/admin/catalog" ||
    pathname.startsWith("/admin/catalog/") ||
    pathname === "/admin/ui" ||
    pathname.startsWith("/admin/ui/")
  );
}

function isCmsDataModel(pathname: string) {
  return (
    pathname === "/admin/catalog" || pathname.startsWith("/admin/catalog/")
  );
}

function isCmsUiEditor(pathname: string) {
  return pathname === "/admin/ui" || pathname.startsWith("/admin/ui/");
}

const CMS_NAV_CHILDREN = [
  { href: "/admin/catalog", labelKey: "cmsDataModel" as const },
  { href: "/admin/ui", labelKey: "cmsUiEditor" as const },
];

function Sidebar({
  isAdmin = false,
  productRoots = [],
}: {
  isAdmin?: boolean;
  productRoots?: AdminProductRootLink[];
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("Admin");
  const links = isAdmin
    ? adminLinks
    : adminLinks.filter((link) => link.href !== "/admin/catalog");
  const onProducts =
    pathname === "/admin/products" || pathname.startsWith("/admin/products/");
  const onCms = isCmsSection(pathname);
  const activeRoot = searchParams.get("root")?.trim() || "";
  const [productsOpen, setProductsOpen] = useState(onProducts);
  const [cmsOpen, setCmsOpen] = useState(onCms);
  const router = useRouter();
  const softNav = useSoftNavOptional();

  function navigate(event: MouseEvent<HTMLAnchorElement>, href: string) {
    if (
      !softNav ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    softNav.startTransition(() => router.push(href));
  }

  useEffect(() => {
    if (onProducts) setProductsOpen(true);
  }, [onProducts]);

  useEffect(() => {
    if (onCms) setCmsOpen(true);
  }, [onCms]);

  return (
    <aside className="min-w-0">
      <Card className="sticky top-16 max-h-[calc(100vh-5rem)] overflow-y-auto shadow-sm lg:top-[4.5rem] lg:max-h-[calc(100vh-6rem)]">
        <CardContent className="grid gap-1 p-3">
          {links.map((link) => {
            if (link.href === "/admin/catalog") {
              return (
                <div key={link.href} className="grid gap-1">
                  <Button
                    type="button"
                    className="w-full justify-between font-normal"
                    variant={onCms ? "default" : "ghost"}
                    aria-expanded={cmsOpen}
                    onClick={() => setCmsOpen((open) => !open)}
                  >
                    <span>{t(link.key)}</span>
                    <LuChevronDown
                      className={cn(
                        "size-4 shrink-0 transition-transform",
                        cmsOpen && "rotate-180"
                      )}
                      aria-hidden
                    />
                  </Button>
                  {cmsOpen ? (
                    <div className="ml-3 grid gap-1 border-l border-border pl-2">
                      {CMS_NAV_CHILDREN.map((child) => {
                        const active =
                          child.href === "/admin/ui"
                            ? isCmsUiEditor(pathname)
                            : isCmsDataModel(pathname);
                        return (
                          <Button
                            key={child.href}
                            asChild
                            size="sm"
                            className="h-9 w-full justify-start font-normal"
                            variant={active ? "default" : "ghost"}
                          >
                            <Link
                              href={child.href}
                              onClick={(event) => navigate(event, child.href)}
                            >
                              {t(child.labelKey)}
                            </Link>
                          </Button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            }

            if (link.href === "/admin/products" && productRoots.length > 0) {
              return (
                <div key={link.href} className="grid gap-1">
                  <Button
                    type="button"
                    className="w-full justify-between font-normal"
                    variant={onProducts ? "default" : "ghost"}
                    aria-expanded={productsOpen}
                    onClick={() => setProductsOpen((open) => !open)}
                  >
                    <span>{t(link.key)}</span>
                    <LuChevronDown
                      className={cn(
                        "size-4 shrink-0 transition-transform",
                        productsOpen && "rotate-180"
                      )}
                      aria-hidden
                    />
                  </Button>
                  {productsOpen ? (
                    <div className="ml-3 grid gap-1 border-l border-border pl-2">
                      {productRoots.map((root) => {
                        const href = `/admin/products?root=${root.id}`;
                        const active = onProducts && activeRoot === root.id;
                        return (
                          <Button
                            key={root.id}
                            asChild
                            size="sm"
                            className="h-9 w-full justify-start font-normal"
                            variant={active ? "default" : "ghost"}
                          >
                            <Link href={href} onClick={(event) => navigate(event, href)}>
                              {root.name}
                            </Link>
                          </Button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            }

            return (
              <Button
                key={link.href}
                asChild
                className="w-full justify-start font-normal"
                variant={isActive(pathname, link.href) ? "default" : "ghost"}
              >
                <Link
                  href={link.href}
                  onClick={(event) => navigate(event, link.href)}
                >
                  {t(link.key)}
                </Link>
              </Button>
            );
          })}
        </CardContent>
      </Card>
    </aside>
  );
}

export default Sidebar;
