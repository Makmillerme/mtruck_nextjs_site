"use client";

import { useMemo, useState } from "react";
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
import { cn } from "@/lib/utils";
import { LuCheck, LuChevronDown } from "react-icons/lu";

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
            // Select this folder; preventDefault keeps Radix from only toggling the submenu.
            event.preventDefault();
            onSelect(item.id);
          }}
        >
          <span className="min-w-0 flex-1 truncate">{item.label}</span>
          {isSelected ? <LuCheck className="mr-1 size-4 shrink-0" /> : null}
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent className="w-max min-w-[10rem]" collisionPadding={12}>
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

export default function CascadeSelect({
  items,
  value,
  onValueChange,
  placeholder,
  emptyLabel,
  allowEmpty = false,
  emptyOptionLabel,
  name,
  disabled = false,
  className,
  triggerClassName,
}: {
  items: CascadeItem[];
  value?: string | null;
  onValueChange?: (id: string | null) => void;
  placeholder: string;
  emptyLabel?: string;
  allowEmpty?: boolean;
  emptyOptionLabel?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const path = useMemo(
    () => (value ? findCascadePath(items, value) : null),
    [items, value]
  );
  const label = formatCascadePath(path);

  function select(id: string | null) {
    onValueChange?.(id);
    setOpen(false);
  }

  return (
    <div className={cn("grid gap-2", className)}>
      {name ? (
        <input type="hidden" name={name} value={value ?? ""} />
      ) : null}
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild disabled={disabled}>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-11 w-full max-w-sm justify-between px-3 font-normal",
              !label && "text-muted-foreground",
              triggerClassName
            )}
          >
            <span className="min-w-0 truncate text-left">
              {label || placeholder}
            </span>
            <LuChevronDown className="size-4 shrink-0 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
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
    </div>
  );
}
