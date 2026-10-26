"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCallback, useTransition } from "react";
import { LuCheck, LuChevronDown, LuLoader } from "react-icons/lu";

const localeCodes: Record<(typeof routing.locales)[number], string> = {
  uk: "UA",
  en: "EN",
  de: "DE",
};

export default function LocaleSwitcher({
  className,
}: {
  className?: string;
}) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("LocaleSwitcher");
  const [isPending, startTransition] = useTransition();

  const currentQuery = useCallback(() => {
    if (typeof window === "undefined") return {};
    return Object.fromEntries(new URLSearchParams(window.location.search));
  }, []);

  function prefetchOtherLocales() {
    const query = currentQuery();
    for (const item of routing.locales) {
      if (item === locale) continue;
      router.prefetch({ pathname, query }, { locale: item });
    }
  }

  function switchLocale(next: (typeof routing.locales)[number]) {
    if (next === locale) return;
    const query = currentQuery();
    startTransition(() => {
      router.replace({ pathname, query }, { locale: next, scroll: false });
    });
  }

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open) prefetchOtherLocales();
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={isPending}
          className={cn(
            "h-9 min-w-0 shrink-0 gap-0.5 px-1.5 text-sm font-medium hover:bg-foreground/10 hover:text-inherit lg:min-w-[3.25rem] lg:gap-1 lg:px-2",
            className
          )}
          aria-label={t("label")}
          aria-busy={isPending || undefined}
        >
          {isPending ? (
            <LuLoader className="size-4 animate-spin" aria-hidden />
          ) : (
            localeCodes[locale as (typeof routing.locales)[number]]
          )}
          <LuChevronDown className="hidden size-4 lg:block" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-28 border-[#E2E8F0] bg-white text-[#0F172A]"
      >
        {routing.locales.map((item) => {
          const active = locale === item;
          return (
            <DropdownMenuItem
              key={item}
              disabled={isPending}
              className="flex cursor-pointer items-center justify-between gap-3 text-[#0F172A] focus:bg-[#F1F5F9] focus:text-[#0F172A]"
              onSelect={() => switchLocale(item)}
            >
              {localeCodes[item]}
              {active ? <LuCheck className="size-4 text-primary" /> : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
