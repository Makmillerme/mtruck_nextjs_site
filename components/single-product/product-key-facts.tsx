import type { ProductKeyFact } from "@/lib/catalog/product-page";
import { cn } from "@/lib/utils";

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
        {facts.map((fact) => (
          <div
            key={fact.key}
            className={cn(
              "grid gap-1 rounded-sm border border-border bg-background",
              compact ? "p-2.5" : "gap-1.5 p-3"
            )}
          >
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
        ))}
      </div>
    </section>
  );
}
