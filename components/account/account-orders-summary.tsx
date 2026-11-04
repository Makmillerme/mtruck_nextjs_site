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
    <Card className={cn("rounded-sm border-border shadow-sm", className)}>
      <CardContent className="grid gap-5 p-5">
        <div className="grid gap-3 text-sm">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-muted-foreground">
              {t("ordersSelectedSubtotal", { count: selectedCount })}
            </span>
            <span className="font-medium tabular-nums text-foreground">
              {totalLabel}
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-t border-border pt-3">
            <span className="font-semibold text-foreground">
              {t("ordersGrandTotal")}
            </span>
            <span className="text-xl font-bold tracking-tight tabular-nums text-foreground">
              {totalLabel}
            </span>
          </div>
        </div>

        <Button
          type="button"
          size="lg"
          className="w-full"
          disabled={disabled}
          onClick={onCheckout}
        >
          {t("goToCheckout")}
          <LuArrowRight className="size-4" aria-hidden />
        </Button>
      </CardContent>
    </Card>
  );
}
