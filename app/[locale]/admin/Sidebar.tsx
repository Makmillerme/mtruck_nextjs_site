"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { LuChevronDown } from "react-icons/lu";
import { adminLinks } from "@/utils/links";
import { Link, usePathname } from "@/i18n/navigation";
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
  const activeRoot = searchParams.get("root")?.trim() || "";
  const [productsOpen, setProductsOpen] = useState(onProducts);

  useEffect(() => {
    if (onProducts) setProductsOpen(true);
  }, [onProducts]);

  return (
    <aside className="min-w-0">
      <Card className="sticky top-16 max-h-[calc(100vh-5rem)] overflow-y-auto shadow-sm lg:top-[4.5rem] lg:max-h-[calc(100vh-6rem)]">
        <CardContent className="grid gap-1 p-3">
          {links.map((link) => {
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
                            <Link href={href}>{root.name}</Link>
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
                <Link href={link.href}>{t(link.key)}</Link>
              </Button>
            );
          })}
        </CardContent>
      </Card>
    </aside>
  );
}

export default Sidebar;
