import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { LuArrowRight, LuLayoutGrid } from "react-icons/lu";

/**
 * Pseudo-card linking to the catalog — text centered, no fake photo block.
 */
export default function CatalogTeaserCard({
  href,
  label,
  hint,
  className,
}: {
  href: string;
  label: string;
  hint?: string;
  className?: string;
}) {
  return (
    <article className={cn("group h-full", className)}>
      <Link
        href={href}
        className="flex h-full min-h-full flex-col items-center justify-center gap-3 overflow-hidden rounded-sm border border-border bg-background px-5 py-8 text-center shadow-sm transition-shadow duration-500 group-hover:shadow-xl sm:px-6"
      >
        <LuLayoutGrid
          className="size-8 text-muted-foreground/80 transition-colors group-hover:text-foreground sm:size-9"
          aria-hidden
        />
        <p className="flex max-w-[16rem] items-center justify-center gap-2 text-lg font-black leading-snug text-foreground lg:text-xl lg:leading-tight">
          <span className="min-w-0">{label}</span>
          <LuArrowRight
            className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
            aria-hidden
          />
        </p>
        {hint ? (
          <p className="max-w-[16rem] text-sm text-muted-foreground">{hint}</p>
        ) : null}
      </Link>
    </article>
  );
}
