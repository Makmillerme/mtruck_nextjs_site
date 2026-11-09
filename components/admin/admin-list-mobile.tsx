"use client";

import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function isInteractiveTarget(
  target: EventTarget | null,
  current: EventTarget | null
) {
  if (!(target instanceof Element) || !(current instanceof Element)) return false;
  const hit = target.closest(
    "a,button,input,textarea,select,label,[role='button'],[data-no-card-activate]"
  );
  // Card itself uses role="button" — only nested controls should block activate.
  return Boolean(hit && hit !== current);
}

/** Right-rail action cluster for admin list cards / table cells. */
export function AdminListMobileActions({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      data-no-card-activate
      className={cn(
        "inline-flex shrink-0 items-center justify-end gap-1",
        className
      )}
      onClick={(event) => event.stopPropagation()}
    >
      {children}
    </div>
  );
}

/**
 * Phone / narrow list row — title + optional subtitle, actions top-right, meta below.
 * `onActivateAction` makes the whole card open edit (skip pencil on phone).
 * Pair with `AdminListResponsive` (cards `<md`, table `md+`).
 */
export function AdminListMobileCard({
  title,
  subtitle,
  meta,
  actions,
  onActivateAction,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  onActivateAction?: () => void;
  className?: string;
}) {
  const interactive = Boolean(onActivateAction);

  function handleClick(event: MouseEvent<HTMLDivElement>) {
    if (!onActivateAction || isInteractiveTarget(event.target, event.currentTarget))
      return;
    // Defer open so the same pointerup cannot dismiss the Sheet overlay (blink).
    const activate = onActivateAction;
    window.setTimeout(() => activate(), 0);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!onActivateAction) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    if (isInteractiveTarget(event.target, event.currentTarget)) return;
    event.preventDefault();
    onActivateAction();
  }

  return (
    <div
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? handleClick : undefined}
      onKeyDown={interactive ? handleKeyDown : undefined}
      className={cn(
        "rounded-sm border border-border bg-card p-3 shadow-sm",
        interactive &&
          "cursor-pointer transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        className
      )}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
        <div className="grid min-w-0 gap-0.5">
          <div className="text-sm font-semibold leading-snug text-foreground">
            {title}
          </div>
          {subtitle ? (
            <div className="text-xs text-muted-foreground">{subtitle}</div>
          ) : null}
        </div>
        {actions}
      </div>
      {meta ? (
        <div className="mt-2 grid gap-1 text-sm text-muted-foreground">{meta}</div>
      ) : null}
    </div>
  );
}

/** Mobile card stack + desktop table card. */
export function AdminListResponsive({
  mobile,
  desktop,
  className,
}: {
  mobile: ReactNode;
  desktop: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="grid gap-3 md:hidden">{mobile}</div>
      <Card className="hidden shadow-sm md:block">
        <CardContent className="p-0">{desktop}</CardContent>
      </Card>
    </div>
  );
}
