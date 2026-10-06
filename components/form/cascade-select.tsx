"use client";

import {
  type KeyboardEvent,
  type ReactNode,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChevronRightIcon } from "@radix-ui/react-icons";
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
import { LuCheck, LuChevronsUpDown } from "react-icons/lu";

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

/**
 * Cascading menu panels for Sheet/Dialog.
 * Same UX as DropdownMenu Sub (hover opens next column, click selects),
 * but plain buttons inside one Popover — Radix Sub is flaky when Sheet
 * sets body { pointer-events: none }.
 */
function CascadePanels({
  items,
  value,
  onSelect,
  leading,
}: {
  items: CascadeItem[];
  value?: string | null;
  onSelect: (id: string) => void;
  leading?: ReactNode;
}) {
  const [activePath, setActivePath] = useState<CascadeItem[]>([]);
  const columnRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [offsets, setOffsets] = useState<number[]>([0]);
  const pointerTypeRef = useRef("mouse");

  const isActive = (depth: number, item: CascadeItem) =>
    activePath[depth]?.id === item.id && activePath.length === depth + 1;

  const openAt = (depth: number, item: CascadeItem) => {
    setActivePath((current) => [...current.slice(0, depth), item]);
  };

  const rowsOf = (depth: number) =>
    Array.from(
      columnRefs.current[depth]?.querySelectorAll<HTMLElement>(
        '[role="menuitem"]'
      ) ?? []
    );

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    depth: number,
    item: CascadeItem
  ) => {
    const rows = rowsOf(depth);
    const index = rows.indexOf(event.currentTarget);
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      rows[(index + step + rows.length) % rows.length]?.focus();
    } else if (event.key === "ArrowRight" && item.children?.length) {
      event.preventDefault();
      openAt(depth, item);
      requestAnimationFrame(() => rowsOf(depth + 1)[0]?.focus());
    } else if (event.key === "ArrowLeft" && depth > 0) {
      event.preventDefault();
      const parentId = activePath[depth - 1]?.id;
      rowsOf(depth - 1)
        .find((row) => row.dataset.cascadeId === parentId)
        ?.focus();
    }
  };

  const columns = useMemo(() => {
    const cols: CascadeItem[][] = [items];
    for (const item of activePath) {
      if (!item.children?.length) break;
      cols.push(item.children);
    }
    return cols;
  }, [items, activePath]);

  // Align each submenu top with its trigger row, like Radix SubContent.
  useLayoutEffect(() => {
    const next = [0];
    for (let depth = 1; depth < columns.length; depth += 1) {
      const parent = columnRefs.current[depth - 1];
      const triggerId = activePath[depth - 1]?.id;
      const trigger = parent?.querySelector<HTMLElement>(
        `[data-cascade-id="${triggerId}"]`
      );
      next.push(
        parent && trigger
          ? next[depth - 1] +
              parent.clientTop +
              trigger.offsetTop -
              parent.scrollTop
          : next[depth - 1]
      );
    }
    setOffsets((current) =>
      current.length === next.length &&
      current.every((offset, index) => offset === next[index])
        ? current
        : next
    );
  }, [columns, activePath]);

  return (
    <div className="flex items-start">
      {columns.map((columnItems, depth) => (
        <div
          key={depth}
          ref={(node) => {
            columnRefs.current[depth] = node;
          }}
          role="menu"
          style={{ marginTop: offsets[depth] ?? 0 }}
          className={cn(
            "relative max-h-[min(24rem,var(--radix-popover-content-available-height))] w-max min-w-[10rem] max-w-sm overflow-y-auto rounded-sm border bg-popover p-1 text-popover-foreground",
            depth > 0 && "-ml-1"
          )}
        >
          {depth === 0 ? leading : null}
          {columnItems.map((item) => {
            const hasChildren = Boolean(item.children?.length);
            const isOpen = hasChildren && activePath[depth]?.id === item.id;
            const isSelected = item.id === value;
            return (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                aria-haspopup={hasChildren ? "menu" : undefined}
                aria-expanded={hasChildren ? isOpen : undefined}
                data-cascade-id={item.id}
                className={cn(
                  "relative flex w-full cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent",
                  isOpen && "bg-accent"
                )}
                onPointerMove={(event) => {
                  if (event.pointerType === "mouse" && !isActive(depth, item)) {
                    openAt(depth, item);
                  }
                }}
                onPointerDown={(event) => {
                  pointerTypeRef.current = event.pointerType;
                }}
                onFocus={() => {
                  if (!isActive(depth, item)) openAt(depth, item);
                }}
                onKeyDown={(event) => handleKeyDown(event, depth, item)}
                onClick={() => {
                  const touch = pointerTypeRef.current !== "mouse";
                  pointerTypeRef.current = "mouse";
                  if (hasChildren && touch && !isOpen) {
                    openAt(depth, item);
                    return;
                  }
                  onSelect(item.id);
                }}
              >
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {isSelected ? (
                  <LuCheck
                    className={cn("size-4 shrink-0", hasChildren && "mr-1")}
                  />
                ) : null}
                {hasChildren ? (
                  <ChevronRightIcon className="ml-auto h-4 w-4 shrink-0" />
                ) : null}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
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
   * `menu` — Radix DropdownMenu Sub (CMS page — no Sheet overlay).
   * `tree` — same cascade UX via Popover panels (Sheet/Dialog-safe).
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

  function select(id: string | null) {
    onValueChange?.(id);
    setOpen(false);
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

  const emptyRow = allowEmpty ? (
    <button
      type="button"
      role="menuitem"
      className="relative flex w-full cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm text-muted-foreground outline-none transition-colors hover:bg-accent focus-visible:bg-accent"
      onClick={() => select(null)}
    >
      <span className="min-w-0 flex-1 truncate">
        {emptyOptionLabel ?? placeholder}
      </span>
      {!value ? <LuCheck className="size-4 shrink-0" /> : null}
    </button>
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
            className="w-auto rounded-none border-0 bg-transparent p-0 shadow-none"
            collisionPadding={12}
          >
            {items.length === 0 ? (
              <div className="w-max min-w-[10rem] rounded-sm border bg-popover p-1 text-popover-foreground">
                {emptyRow}
                {emptyBlock}
              </div>
            ) : (
              <CascadePanels
                items={items}
                value={value}
                onSelect={(id) => select(id)}
                leading={emptyRow}
              />
            )}
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
