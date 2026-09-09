"use client";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { LuHeart } from "react-icons/lu";

export default function FavoritesButton({
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
      <Link href="/account/favorites">
        <LuHeart className="size-5" />
        <span className="sr-only">{t("favorites")}</span>
      </Link>
    </Button>
  );
}
