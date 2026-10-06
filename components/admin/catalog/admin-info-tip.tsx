"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function AdminInfoTip({
  label,
  children,
  size = "default",
}: {
  label: string;
  children: ReactNode;
  size?: "default" | "sm";
}) {
  const compact = size === "sm";
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={
              compact
                ? "size-3.5 shrink-0 rounded-full p-0"
                : "size-8 shrink-0 rounded-full"
            }
            aria-label={label}
          >
            <span
              className={
                compact
                  ? "text-[10px] font-semibold leading-none"
                  : "text-xs font-semibold leading-none"
              }
            >
              i
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          align="end"
          className="max-w-sm space-y-2 p-3 text-left text-xs font-normal leading-relaxed"
        >
          {children}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
