import { cn } from "@/lib/utils";

/** 12-col section intro. `start` = title left / lede right. `end` = lede left / title right. */
export default function SectionIntro({
  id,
  eyebrow,
  title,
  lede,
  align = "start",
  tone = "light",
  className,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  lede?: string;
  align?: "start" | "end";
  tone?: "light" | "dark";
  className?: string;
}) {
  const end = align === "end";
  const dark = tone === "dark";

  return (
    <header
      className={cn(
        "grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-16",
        className
      )}
    >
      <div
        className={cn(
          "lg:col-span-5",
          end && "lg:col-start-8 lg:text-right"
        )}
      >
        <p
          className={cn(
            "mb-3 font-mono text-xs font-medium uppercase tracking-[0.22em]",
            dark ? "text-background/60" : "text-muted-foreground"
          )}
        >
          {eyebrow}
        </p>
        <h2
          id={id}
          className={cn(
            "text-3xl font-black tracking-tight md:text-4xl lg:text-[2.75rem] lg:leading-[1.12]",
            dark ? "text-background" : "text-foreground"
          )}
        >
          {title}
        </h2>
      </div>
      {lede ? (
        <p
          className={cn(
            "max-w-xl text-base leading-relaxed lg:col-span-7 lg:text-lg",
            dark ? "text-background/70" : "text-muted-foreground",
            end ? "lg:col-start-1 lg:row-start-1" : "lg:justify-self-end"
          )}
        >
          {lede}
        </p>
      ) : null}
    </header>
  );
}
