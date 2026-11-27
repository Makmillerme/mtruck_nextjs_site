"use client";

import { Button } from "@/components/ui/button";
import { SITE_TELEGRAM_URL } from "@/lib/site-contact";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { FaTelegram } from "react-icons/fa";
import { LuClock, LuPhone } from "react-icons/lu";

/** Phone + Telegram + hours under buy-box CTAs. */
export default function ProductBuyBoxContact({
  className,
}: {
  className?: string;
}) {
  const t = useTranslations("Product");
  const tFooter = useTranslations("Footer");

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Button asChild variant="outline" size="sm" className="h-9">
          <a href={tFooter("phone.href")} aria-label={t("contactCall")}>
            <LuPhone className="size-4" aria-hidden />
            {tFooter("phone.value")}
          </a>
        </Button>
        <Button asChild variant="outline" size="sm" className="h-9">
          <a
            href={SITE_TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("contactTelegram")}
          >
            <FaTelegram className="size-4" aria-hidden />
            {t("contactTelegram")}
          </a>
        </Button>
      </div>
      <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <LuClock className="size-3.5 shrink-0" aria-hidden />
        {tFooter("hours")}
      </p>
    </div>
  );
}
