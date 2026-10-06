"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { sheetFieldTriggerClassName } from "@/lib/ui/sheet-field";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/format";
import { LuCalendar } from "react-icons/lu";

/** Parse YYYY-MM-DD as local calendar day (no UTC shift). */
export function parseSheetDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return undefined;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined;
  }
  return date;
}

/** Format local Date as YYYY-MM-DD for filter drafts / forms. */
export function formatSheetDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Sheet date field canon: outline Button h-11 + LuCalendar + Popover
 * `modal={false}` (nested in Sheet) + Calendar. Value is YYYY-MM-DD.
 */
export function SheetDateField({
  name,
  label,
  placeholder,
  value,
  onValueChange,
  allowClear = true,
  clearLabel,
  disabled = false,
  hideLabel = false,
  className,
}: {
  name?: string;
  label: string;
  placeholder: string;
  value?: string;
  onValueChange: (value: string | undefined) => void;
  allowClear?: boolean;
  clearLabel?: string;
  disabled?: boolean;
  hideLabel?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const locale = useLocale();
  const selected = parseSheetDate(value);

  return (
    <div className={cn("grid gap-2", className)}>
      {hideLabel ? (
        <span className="sr-only">{label}</span>
      ) : (
        <label className="text-sm font-medium">{label}</label>
      )}
      {name ? (
        <input type="hidden" name={name} value={value ?? ""} />
      ) : null}
      <Popover
        modal={false}
        open={open}
        onOpenChange={setOpen}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label={label}
            disabled={disabled}
            className={cn(
              sheetFieldTriggerClassName,
              !selected && "text-muted-foreground",
              selected && "border-foreground/30"
            )}
          >
            <span className="min-w-0 truncate text-left">
              {selected ? formatDate(selected, locale) : placeholder}
            </span>
            <LuCalendar className="size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="z-[200] w-auto p-0"
          align="start"
          onOpenAutoFocus={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          <Calendar
            mode="single"
            selected={selected}
            defaultMonth={selected}
            onSelect={(date) => {
              onValueChange(date ? formatSheetDate(date) : undefined);
              setOpen(false);
            }}
          />
          {allowClear && value ? (
            <div className="border-t p-2">
              <Button
                type="button"
                variant="ghost"
                className="h-9 w-full text-sm"
                onClick={() => {
                  onValueChange(undefined);
                  setOpen(false);
                }}
              >
                {clearLabel ?? placeholder}
              </Button>
            </div>
          ) : null}
        </PopoverContent>
      </Popover>
    </div>
  );
}
