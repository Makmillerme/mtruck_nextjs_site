"use client";
import { adminLinks } from "@/utils/links";
import { Link, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";

function isActive(pathname: string, href: string) {
  if (pathname === href) return true;
  if (href === "/admin/products") {
    return (
      pathname.startsWith("/admin/products/") &&
      pathname !== "/admin/products/create"
    );
  }
  return false;
}

function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations("Admin");

  return (
    <aside className="min-w-0">
      <Card className="sticky top-16 max-h-[calc(100vh-5rem)] overflow-y-auto shadow-sm lg:top-[4.5rem] lg:max-h-[calc(100vh-6rem)]">
        <CardContent className="grid gap-1 p-3">
          {adminLinks.map((link) => (
            <Button
              key={link.href}
              asChild
              className="w-full justify-start font-normal"
              variant={isActive(pathname, link.href) ? "default" : "ghost"}
            >
              <Link href={link.href}>{t(link.key)}</Link>
            </Button>
          ))}
        </CardContent>
      </Card>
    </aside>
  );
}
export default Sidebar;
