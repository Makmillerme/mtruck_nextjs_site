import type { ProductKeyFact } from "@/lib/catalog/product-page";
import { cn } from "@/lib/utils";
import {
  LuCalendar,
  LuFuel,
  LuGauge,
  LuSettings2,
  LuTag,
  LuTruck,
} from "react-icons/lu";
import type { IconType } from "react-icons";

const KEY_ICONS: Record<string, IconType> = {
  year: LuCalendar,
  mileage: LuGauge,
  km: LuGauge,
  odometer: LuGauge,
  fuel: LuFuel,
  engine: LuSettings2,
  power: LuSettings2,
  transmission: LuSettings2,
  gearbox: LuSettings2,
  make: LuTruck,
  model: LuTruck,
  axle: LuTruck,
};

function iconForKey(key: string): IconType {
  const normalized = key.toLowerCase();
  for (const [fragment, Icon] of Object.entries(KEY_ICONS)) {
    if (normalized.includes(fragment)) return Icon;
  }
  return LuTag;
}

export default function ProductKeyFacts({
  facts,
  title,
  variant = "strip",
}: {
  facts: ProductKeyFact[];
  title?: string;
  /** `compact` — buy-box (2 cols); `strip` — full-width lab demo. */
  variant?: "strip" | "compact";
}) {
  if (facts.length === 0) return null;

  const compact = variant === "compact";

  return (
    <section
      className={cn("grid gap-3", !compact && "scroll-mt-24")}
      aria-label={title}
    >
      {title && !compact ? (
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h2>
      ) : null}
      <div
        className={cn(
          "grid gap-2",
          compact
            ? "grid-cols-2 sm:grid-cols-3"
            : "grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
        )}
      >
        {facts.map((fact) => {
          const Icon = iconForKey(fact.key);
          return (
            <div
              key={fact.key}
              className={cn(
                "grid gap-1.5 rounded-sm border border-border bg-background",
                compact ? "p-2.5" : "gap-2 p-3"
              )}
            >
              <Icon
                className={cn(
                  "text-muted-foreground",
                  compact ? "size-3.5" : "size-4"
                )}
                aria-hidden
              />
              <p
                className={cn(
                  "font-mono uppercase tracking-[0.14em] text-muted-foreground",
                  compact ? "text-[10px]" : "text-[11px] tracking-[0.16em]"
                )}
              >
                {fact.label}
              </p>
              <p
                className={cn(
                  "truncate font-semibold text-foreground",
                  compact ? "text-xs" : "text-sm"
                )}
              >
                {fact.value}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
