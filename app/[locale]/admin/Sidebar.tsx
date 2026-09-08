"use client";
import { adminLinks } from "@/utils/links";
import { Link, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations("Admin");

  return (
    <aside>
      {adminLinks.map((link) => {
        const isActivePage = pathname === link.href;
        const variant = isActivePage ? "default" : "ghost";
        return (
          <Button
            key={link.href}
            asChild
            className="w-full mb-2 font-normal justify-start"
            variant={variant}
          >
            <Link href={link.href}>{t(link.key)}</Link>
          </Button>
        );
      })}
    </aside>
  );
}
export default Sidebar;
