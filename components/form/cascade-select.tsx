"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { sheetFieldTriggerClassName } from "@/lib/ui/sheet-field";
import { LuCheck, LuChevronsUpDown, LuChevronRight } from "react-icons/lu";

export type CascadeItem = {
  id: string;
  label: string;
  children?: CascadeItem[];
};

export function findCascadePath(
  items: CascadeItem[],
  id: string,
  trail: CascadeItem[] = []
): CascadeItem[] | null {
  for (const item of items) {
    const next = [...trail, item];
    if (item.id === id) return next;
    if (item.children?.length) {
      const found = findCascadePath(item.children, id, next);
      if (found) return found;
    }
  }
  return null;
}

function formatCascadePath(path: CascadeItem[] | null) {
  if (!path?.length) return "";
  return path.map((item) => item.label).join(" / ");
}

function CascadeMenuItems({
  items,
  value,
  onSelect,
}: {
  items: CascadeItem[];
  value?: string | null;
  onSelect: (id: string) => void;
}) {
  return items.map((item) => {
    const hasChildren = Boolean(item.children?.length);
    const isSelected = item.id === value;

    if (!hasChildren) {
      return (
        <DropdownMenuItem
          key={item.id}
          className="gap-2"
          data-cascade-id={item.id}
          onSelect={(event) => {
            event.preventDefault();
            onSelect(item.id);
          }}
        >
          <span className="min-w-0 flex-1 truncate">{item.label}</span>
          {isSelected ? <LuCheck className="size-4 shrink-0" /> : null}
        </DropdownMenuItem>
      );
    }

    return (
      <DropdownMenuSub key={item.id}>
        <DropdownMenuSubTrigger
          className="gap-2"
          data-cascade-id={item.id}
          onClick={(event) => {
            event.preventDefault();
            onSelect(item.id);
          }}
        >
          <span className="min-w-0 flex-1 truncate">{item.label}</span>
          {isSelected ? <LuCheck className="mr-1 size-4 shrink-0" /> : null}
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent
          className="w-max min-w-[10rem]"
          collisionPadding={12}
        >
          <CascadeMenuItems
            items={item.children!}
            value={value}
            onSelect={onSelect}
          />
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    );
  });
}

function CascadeTreeRows({
  items,
  value,
  depth,
  expanded,
  onToggle,
  onSelect,
}: {
  items: CascadeItem[];
  value?: string | null;
  depth: number;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
}) {
  const rows = items.map((item) => {
    const hasChildren = Boolean(item.children?.length);
    const isSelected = item.id === value;
    const isOpen = expanded.has(item.id);

    return (
      <div key={item.id} className="grid gap-0.5">
        <div className="flex items-center gap-0.5">
          {hasChildren ? (
            <button
              type="button"
              className="inline-flex size-7 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-expanded={isOpen}
              aria-label={item.label}
              onClick={() => onToggle(item.id)}
            >
              <LuChevronRight
                className={cn(
                  "size-3.5 transition-transform",
                  isOpen && "rotate-90"
                )}
              />
            </button>
          ) : (
            <span className="size-7 shrink-0" />
          )}
          <button
            type="button"
            data-cascade-id={item.id}
            className={cn(
              "flex min-w-0 flex-1 items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-none hover:bg-accent",
              isSelected && "bg-accent"
            )}
            onClick={() => onSelect(item.id)}
          >
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            {isSelected ? <LuCheck className="size-4 shrink-0" /> : null}
          </button>
        </div>
        {hasChildren && isOpen ? (
          <div className="ml-3 grid gap-0.5 border-l border-border pl-2">
            <CascadeTreeRows
              items={item.children!}
              value={value}
              depth={depth + 1}
              expanded={expanded}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          </div>
        ) : null}
      </div>
    );
  });

  return <>{rows}</>;
}

/** Expand only ancestors on the selected path (not every branch). */
function initialExpanded(_items: CascadeItem[], path: CascadeItem[] | null) {
  const ids = new Set<string>();
  if (path) {
    for (const item of path.slice(0, -1)) ids.add(item.id);
  }
  return ids;
}

export default function CascadeSelect({
  items,
  value,
  onValueChange,
  placeholder,
  emptyLabel,
  allowEmpty = false,
  emptyOptionLabel,
  name,
  required = false,
  disabled = false,
  className,
  triggerClassName,
  /**
   * `menu` — UI Lab / CMS (hover submenus).
   * `tree` — Popover tree for use inside Sheet/Dialog (Radix Sub is flaky there).
   */
  variant = "menu",
}: {
  items: CascadeItem[];
  value?: string | null;
  onValueChange?: (id: string | null) => void;
  placeholder: string;
  emptyLabel?: string;
  allowEmpty?: boolean;
  emptyOptionLabel?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  variant?: "menu" | "tree";
}) {
  const [open, setOpen] = useState(false);
  const path = useMemo(
    () => (value ? findCascadePath(items, value) : null),
    [items, value]
  );
  const label = formatCascadePath(path);
  const [expanded, setExpanded] = useState(() =>
    initialExpanded(items, path)
  );

  useEffect(() => {
    setExpanded(initialExpanded(items, path));
  }, [items, path]);

  function select(id: string | null) {
    onValueChange?.(id);
    setOpen(false);
  }

  function toggle(id: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const trigger = (
    <Button
      type="button"
      variant="outline"
      role="combobox"
      aria-expanded={open}
      disabled={disabled}
      className={cn(
        sheetFieldTriggerClassName,
        !label && "text-muted-foreground",
        triggerClassName
      )}
    >
      <span className="min-w-0 truncate text-left">
        {label || placeholder}
      </span>
      <LuChevronsUpDown className="size-4 shrink-0 opacity-50" />
    </Button>
  );

  const emptyBlock =
    items.length === 0 ? (
      <p className="px-2 py-1.5 text-sm text-muted-foreground">
        {emptyLabel ?? placeholder}
      </p>
    ) : null;

  return (
    <div className={cn("grid gap-2", className)}>
      {name ? (
        <input
          type="hidden"
          name={name}
          value={value ?? ""}
          required={required}
        />
      ) : null}

      {variant === "tree" ? (
        <Popover modal={false} open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>{trigger}</PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-[var(--radix-popover-trigger-width)] max-w-sm p-1"
            collisionPadding={12}
          >
            <div className="max-h-72 overflow-y-auto py-1">
              {allowEmpty ? (
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm text-muted-foreground outline-none hover:bg-accent"
                  onClick={() => select(null)}
                >
                  <span className="min-w-0 flex-1 truncate">
                    {emptyOptionLabel ?? placeholder}
                  </span>
                  {!value ? <LuCheck className="size-4 shrink-0" /> : null}
                </button>
              ) : null}
              {emptyBlock}
              {items.length > 0 ? (
                <CascadeTreeRows
                  items={items}
                  value={value}
                  depth={0}
                  expanded={expanded}
                  onToggle={toggle}
                  onSelect={(id) => select(id)}
                />
              ) : null}
            </div>
          </PopoverContent>
        </Popover>
      ) : (
        <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-max min-w-[10rem] max-w-sm"
            collisionPadding={12}
          >
            {allowEmpty ? (
              <DropdownMenuItem
                className="gap-2 text-muted-foreground"
                onSelect={(event) => {
                  event.preventDefault();
                  select(null);
                }}
              >
                <span className="min-w-0 flex-1 truncate">
                  {emptyOptionLabel ?? placeholder}
                </span>
                {!value ? <LuCheck className="size-4 shrink-0" /> : null}
              </DropdownMenuItem>
            ) : null}
            {items.length === 0 ? (
              <DropdownMenuItem disabled>
                {emptyLabel ?? placeholder}
              </DropdownMenuItem>
            ) : (
              <CascadeMenuItems
                items={items}
                value={value}
                onSelect={(id) => select(id)}
              />
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
