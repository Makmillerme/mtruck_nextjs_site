"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { LuBell } from "react-icons/lu";

export type NotificationPreview = {
  id: string;
  phone: string;
  productName: string | null;
  productCode: string | null;
  createdAt: string;
};

export default function NotificationsButton({
  className,
  isStaff = false,
  unreadCount = 0,
  items = [],
}: {
  className?: string;
  isStaff?: boolean;
  unreadCount?: number;
  items?: NotificationPreview[];
}) {
  const t = useTranslations("Admin");
  const badge =
    unreadCount > 0 ? (unreadCount > 9 ? "9+" : String(unreadCount)) : null;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn("relative", className)}
          aria-label={t("notifications")}
        >
          <LuBell className="size-5" />
          {badge ? (
            /* Outer inherits header ink (same as SVG); ring follows currentColor with header color transition. */
            <span className="absolute right-0.5 top-0.5 rounded-full text-inherit ring-2 ring-current">
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground">
                {badge}
              </span>
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>{t("notifications")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {!isStaff || items.length === 0 ? (
          <div className="px-2 py-3 text-sm text-muted-foreground">
            {t("notificationsEmpty")}
          </div>
        ) : (
          items.map((item) => (
            <DropdownMenuItem key={item.id} asChild>
              <Link href="/admin/sales/inquiries" className="flex flex-col items-start gap-0.5">
                <span className="text-sm font-medium">{t("notificationsInquiry")}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {item.phone}
                  {item.productName ? ` · ${item.productName}` : ""}
                </span>
              </Link>
            </DropdownMenuItem>
          ))
        )}
        {isStaff ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/sales/inquiries">{t("notificationsViewAll")}</Link>
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
