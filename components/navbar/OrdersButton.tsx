"use client";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { LuShoppingCart } from "react-icons/lu";

export default function OrdersButton({
  className,
}: {
  className?: string;
}) {
  const t = useTranslations("Navbar");

  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      className={cn("hidden size-9 shrink-0 lg:inline-flex", className)}
    >
      <Link href="/account?tab=orders">
        <LuShoppingCart className="size-5" aria-hidden />
        <span className="sr-only">{t("orders")}</span>
      </Link>
    </Button>
  );
}
