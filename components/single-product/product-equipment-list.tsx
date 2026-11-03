import { cn } from "@/lib/utils";
import { LuCheck } from "react-icons/lu";

const EQUIPMENT_COLUMNS = 3;

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

/**
 * LIST tab / комплектація — Specs-rhythm checklist (UI Lab canon).
 * Column-major: 1 → 2 (sm) → 3 (lg) columns.
 */
export default function ProductEquipmentList({
  items,
  className,
}: {
  items: string[];
  className?: string;
}) {
  if (items.length === 0) return null;

  const columns = columnChunks(items, EQUIPMENT_COLUMNS);
  const tallest = Math.max(...columns.map((col) => col.length));

  return (
    <div
      className={cn(
        "grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {columns.map((column, colIndex) => (
        <ul
          key={colIndex}
          className="min-w-0 divide-y divide-border/60"
        >
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
