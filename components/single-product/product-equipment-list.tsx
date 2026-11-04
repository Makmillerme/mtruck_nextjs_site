"use client";

import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { LuCheck } from "react-icons/lu";

function EquipmentRow({ item }: { item: string }) {
  return (
    <li className="flex items-center gap-2.5 py-2.5 text-sm">
      <span
        className="flex size-5 shrink-0 items-center justify-center rounded-sm bg-muted text-foreground"
        aria-hidden
      >
        <LuCheck className="size-3.5" strokeWidth={2.25} />
      </span>
      <span className="min-w-0 font-medium text-foreground">{item}</span>
    </li>
  );
}

function columnChunks(items: string[], columns: number): string[][] {
  const size = Math.ceil(items.length / columns);
  return Array.from({ length: columns }, (_, index) =>
    items.slice(index * size, (index + 1) * size)
  );
}

function subscribeBreakpoint(onStoreChange: () => void) {
  const sm = window.matchMedia("(min-width: 640px)");
  const lg = window.matchMedia("(min-width: 1024px)");
  sm.addEventListener("change", onStoreChange);
  lg.addEventListener("change", onStoreChange);
  return () => {
    sm.removeEventListener("change", onStoreChange);
    lg.removeEventListener("change", onStoreChange);
  };
}

function getEquipmentColumnCount() {
  if (typeof window === "undefined") return 1;
  if (window.matchMedia("(min-width: 1024px)").matches) return 3;
  if (window.matchMedia("(min-width: 640px)").matches) return 2;
  return 1;
}

function useEquipmentColumnCount() {
  return useSyncExternalStore(
    subscribeBreakpoint,
    getEquipmentColumnCount,
    () => 1
  );
}

/**
 * LIST tab / комплектація — Specs-rhythm checklist (UI Lab canon).
 * Column-major: 1 → 2 (sm) → 3 (lg) columns — chunk count matches CSS grid.
 */
export default function ProductEquipmentList({
  items,
  className,
}: {
  items: string[];
  className?: string;
}) {
  const columnCount = useEquipmentColumnCount();

  if (items.length === 0) return null;

  const columns = columnChunks(items, columnCount);
  const tallest = Math.max(...columns.map((col) => col.length), 0);

  return (
    <div
      className={cn(
        "grid gap-x-8",
        columnCount >= 2 && "grid-cols-2",
        columnCount >= 3 && "grid-cols-3",
        className
      )}
    >
      {columns.map((column, colIndex) => (
        <ul key={colIndex} className="min-w-0 divide-y divide-border/60">
          {column.map((item) => (
            <EquipmentRow key={item} item={item} />
          ))}
          {Array.from({ length: tallest - column.length }, (_, index) => (
            <li
              key={`pad-${colIndex}-${index}`}
              className="pointer-events-none select-none py-2.5 text-sm opacity-0"
              aria-hidden
            >
              —
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}
