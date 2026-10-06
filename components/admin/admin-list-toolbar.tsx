"use client";

import * as React from "react";
import { type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { sheetScrollBodyClassName } from "@/lib/ui/sheet-field";
import { cn } from "@/lib/utils";
import { LuListFilter, LuPlus, LuSearch } from "react-icons/lu";

export default function AdminListToolbar({
  search,
  onSearchChange,
  searchPlaceholder,
  filterSheet,
  toolbarActions,
  createLabel,
  onCreate,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  filterSheet?: ReactNode;
  toolbarActions?: ReactNode;
  createLabel: string;
  onCreate: () => void;
}) {
  return (
    <div className="flex w-full min-w-0 items-center gap-2">
      <div className="relative min-w-0 flex-1">
        <LuSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={search}
          placeholder={searchPlaceholder}
          className="h-9 min-w-0 pl-9"
          onChange={(event) => onSearchChange(event.target.value)}
          aria-label={searchPlaceholder}
        />
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {filterSheet}
        {toolbarActions}
        <Button
          type="button"
          size="sm"
          className="h-9 gap-2 whitespace-nowrap"
          onClick={onCreate}
        >
          <LuPlus className="size-4 shrink-0" />
          <span className="hidden sm:inline">{createLabel}</span>
        </Button>
      </div>
    </div>
  );
}

export const AdminFilterTrigger = React.forwardRef<
  HTMLButtonElement,
  {
    label: string;
    count: number;
  } & React.ComponentPropsWithoutRef<typeof Button>
>(function AdminFilterTrigger(
  { label, count, className, ...props },
  ref
) {
  return (
    <Button
      ref={ref}
      type="button"
      variant="default"
      size="sm"
      className={cn("relative h-9 gap-2 whitespace-nowrap", className)}
      aria-label={label}
      {...props}
    >
      <LuListFilter className="size-4 shrink-0" />
      <span className="hidden sm:inline">{label}</span>
      {count > 0 ? (
        <Badge className="h-5 min-w-5 border-0 bg-primary-foreground px-1.5 text-primary hover:bg-primary-foreground">
          {count}
        </Badge>
      ) : null}
    </Button>
  );
});
AdminFilterTrigger.displayName = "AdminFilterTrigger";

type AdminFilterSheetHelpers = { close: () => void };

/**
 * Admin list filter — same controlled Sheet chrome as catalog mobile filter
 * (`CatalogFilterSheet`: title header, scroll body, apply + clear footer).
 * Pass `hideFooter` when children own Apply/Clear (e.g. CatalogFilterFields).
 */
export function AdminFilterSheet({
  label,
  count,
  clearLabel,
  applyLabel,
  onClear,
  hideFooter = false,
  onOpenChange,
  children,
}: {
  label: string;
  count: number;
  clearLabel: string;
  applyLabel: string;
  onClear: () => void;
  /** Body includes its own apply/clear (catalog tree). */
  hideFooter?: boolean;
  /** Sync draft from applied when the sheet opens. */
  onOpenChange?: (open: boolean) => void;
  children: ReactNode | ((helpers: AdminFilterSheetHelpers) => ReactNode);
}) {
  const [open, setOpen] = React.useState(false);
  const close = () => setOpen(false);
  const body =
    typeof children === "function" ? children({ close }) : children;

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        onOpenChange?.(next);
      }}
    >
      <SheetTrigger asChild>
        <AdminFilterTrigger label={label} count={count} />
      </SheetTrigger>
      {/*
        Admin sheet canon: default SheetContent (p-6 pt-8 gap-6).
        overflow-hidden + flex contain keep sticky footer; p-px gutter
        (sheetScrollBodyClassName) prevents border/ring clip.
      */}
      <SheetContent className="overflow-hidden">
        <SheetHeader className="shrink-0">
          <SheetTitle>{label}</SheetTitle>
        </SheetHeader>
        {hideFooter ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {body}
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-hidden">
            <div className={cn(sheetScrollBodyClassName, "pr-1")}>{body}</div>
            <div className="mt-auto shrink-0 space-y-2 p-px">
              <Button
                type="button"
                variant="default"
                className="h-11 w-full"
                onClick={close}
              >
                {applyLabel}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full"
                disabled={count === 0}
                onClick={onClear}
              >
                {clearLabel}
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
