import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { getTranslations } from "next-intl/server";

const CASES = [
  {
    key: "lviv",
    image: "/images/hero.webp",
    object: "object-[32%_center]",
  },
  {
    key: "kyiv",
    image: "/images/hero.webp",
    object: "object-[58%_center]",
  },
  {
    key: "odesa",
    image: "/images/hero.webp",
    object: "object-[78%_center]",
  },
] as const;

export default async function SalesCasesSection() {
  const t = await getTranslations("SalesCases");

  return (
    <section
      id="sales-cases"
      aria-labelledby="sales-cases-heading"
      className="full-bleed bg-background"
    >
      <div className="page-container py-16 md:py-24">
        <header className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-16">
          <div className="lg:col-span-5">
            <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
              {t("eyebrow")}
            </p>
            <h2
              id="sales-cases-heading"
              className="text-balance text-3xl font-black tracking-tight text-foreground md:text-4xl lg:text-[2.75rem] lg:leading-[1.12]"
            >
              {t("title")}
            </h2>
          </div>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground lg:col-span-7 lg:justify-self-end lg:text-lg">
            {t("subtitle")}
          </p>
        </header>

        <Separator className="my-12 bg-border lg:my-16" />

        <ol className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.3fr)_minmax(0,1.05fr)] lg:gap-px lg:bg-border">
          {CASES.map((item, index) => (
            <li key={item.key} className="bg-background">
              <figure className="overflow-hidden bg-secondary">
                <img
                  src={item.image}
                  alt=""
                  className={cn(
                    "h-56 w-full object-cover sm:h-72 lg:h-[32rem]",
                    item.object
                  )}
                />
              </figure>
              <div className="flex flex-col gap-1.5 pt-5 lg:px-7 lg:pt-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  {String(index + 1).padStart(2, "0")} · {t(`cases.${item.key}.route`)}
                </p>
                <h3 className="text-lg font-black tracking-tight text-foreground lg:text-xl">
                  {t(`cases.${item.key}.model`)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(`cases.${item.key}.buyer`)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
