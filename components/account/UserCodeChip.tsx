"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { LuCheck, LuCopy } from "react-icons/lu";

export default function UserCodeChip({
  code,
  className,
  compact = false,
}: {
  code: string;
  className?: string;
  /** Smaller layout for dropdown / tight headers */
  compact?: boolean;
}) {
  const t = useTranslations("AccountCabinet");
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast({ description: t("clientCodeCopied") });
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast({
        variant: "destructive",
        description: t("clientCodeCopyFailed"),
      });
    }
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border border-border bg-muted/40",
        compact ? "px-2 py-1" : "px-2.5 py-1.5",
        className
      )}
    >
      <div className="min-w-0">
        {!compact ? (
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {t("clientCodeLabel")}
          </p>
        ) : null}
        <p
          className={cn(
            "font-medium tabular-nums text-foreground",
            compact ? "text-xs" : "text-sm"
          )}
          title={compact ? t("clientCodeLabel") : undefined}
        >
          {compact ? (
            <span className="text-muted-foreground">№ </span>
          ) : null}
          {code}
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(
          "shrink-0 text-muted-foreground hover:text-foreground",
          compact ? "size-7" : "size-8"
        )}
        aria-label={t("copyClientCode")}
        onClick={handleCopy}
      >
        {copied ? (
          <LuCheck className="size-3.5 text-emerald-600" />
        ) : (
          <LuCopy className="size-3.5" />
        )}
      </Button>
    </div>
  );
}
