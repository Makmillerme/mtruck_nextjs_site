import type { ProductKeyFact } from "@/lib/catalog/product-page";
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
}: {
  facts: ProductKeyFact[];
  title?: string;
}) {
  if (facts.length === 0) return null;

  return (
    <section className="grid gap-3" aria-label={title}>
      {title ? (
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h2>
      ) : null}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {facts.map((fact) => {
          const Icon = iconForKey(fact.key);
          return (
            <div
              key={fact.key}
              className="grid gap-2 rounded-sm border border-border bg-background p-3"
            >
              <Icon
                className="size-4 text-muted-foreground"
                aria-hidden
              />
              <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
                {fact.label}
              </p>
              <p className="truncate text-sm font-semibold text-foreground">
                {fact.value}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
