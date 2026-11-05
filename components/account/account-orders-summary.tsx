"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { LuArrowRight } from "react-icons/lu";

export default function AccountOrdersSummary({
  selectedCount,
  totalLabel,
  onCheckout,
  className,
}: {
  selectedCount: number;
  totalLabel: string;
  onCheckout: () => void;
  className?: string;
}) {
  const t = useTranslations("AccountCabinet");
  const disabled = selectedCount < 1;

  return (
    <Card className={cn("min-w-0 rounded-sm border-border shadow-sm", className)}>
      <CardContent className="grid min-w-0 gap-4 p-4">
        <div className="grid min-w-0 gap-3 text-sm">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <span className="min-w-0 flex-1 leading-snug text-muted-foreground">
              {t("ordersSelectedSubtotal", { count: selectedCount })}
            </span>
            <span className="shrink-0 text-right font-medium tabular-nums text-foreground">
              {totalLabel}
            </span>
          </div>
          <div className="flex min-w-0 items-start justify-between gap-3 border-t border-border pt-3">
            <span className="min-w-0 flex-1 pt-0.5 font-semibold leading-snug text-foreground">
              {t("ordersGrandTotal")}
            </span>
            <span className="shrink-0 text-right text-lg font-bold tracking-tight tabular-nums text-foreground">
              {totalLabel}
            </span>
          </div>
        </div>

        <Button
          type="button"
          size="lg"
          className="h-11 w-full gap-2 whitespace-normal px-3 text-center text-sm leading-tight sm:whitespace-nowrap"
          disabled={disabled}
          onClick={onCheckout}
        >
          {t("goToCheckout")}
          <LuArrowRight className="size-4 shrink-0" aria-hidden />
        </Button>
      </CardContent>
    </Card>
  );
}
