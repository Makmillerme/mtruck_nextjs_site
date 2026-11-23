"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { notify } from "@/lib/ui/notify";
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
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      notify.success(t("clientCodeCopied"));
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      notify.error(t("clientCodeCopyFailed"));
    }
  }

  const copyIcon = copied ? (
    <LuCheck className="size-3.5 text-emerald-600" />
  ) : (
    <LuCopy className="size-3.5" />
  );

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn(
        "h-auto shrink-0 border-border bg-background font-medium text-foreground shadow-none hover:border-border hover:bg-foreground/10 hover:text-foreground",
        compact ? "h-7 gap-1.5 px-2 text-xs tabular-nums" : "items-center gap-2 px-2.5 py-1.5",
        className
      )}
      title={t("clientCodeLabel")}
      aria-label={t("copyClientCode")}
      onClick={() => void handleCopy()}
    >
      {compact ? (
        <>
          {code}
          {copyIcon}
        </>
      ) : (
        <span className="flex flex-col items-start">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {t("clientCodeLabel")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="text-sm tabular-nums">{code}</span>
            {copyIcon}
          </span>
        </span>
      )}
    </Button>
  );
}
