import { cn } from "@/lib/utils";
import { getTranslations } from "next-intl/server";

const CASES = [
  {
    key: "lviv",
    image: "/images/hero.webp",
    object: "object-[22%_center]",
    frame: "lg:origin-bottom-left lg:-rotate-2",
    offset: "",
  },
  {
    key: "kyiv",
    image: "/images/hero.webp",
    object: "object-[58%_center]",
    frame: "lg:rotate-1",
    offset: "lg:ml-[16%] lg:-mt-8",
  },
  {
    key: "odesa",
    image: "/images/hero.webp",
    object: "object-[82%_center]",
    frame: "lg:origin-bottom-right lg:-rotate-1",
    offset: "lg:ml-[32%] lg:-mt-8",
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
        <header className="max-w-2xl">
          <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
            {t("eyebrow")}
          </p>
          <h2
            id="sales-cases-heading"
            className="text-balance text-3xl font-black tracking-tight text-foreground md:text-4xl lg:text-[2.75rem] lg:leading-[1.12]"
          >
            {t("title")}
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground lg:text-lg">
            {t("subtitle")}
          </p>
        </header>

        <ol className="mt-14 flex flex-col gap-12 lg:mt-20 lg:gap-0">
          {CASES.map((item) => (
            <li key={item.key} className={cn("max-w-xl", item.offset)}>
              <figure className={cn("overflow-hidden rounded-sm bg-secondary", item.frame)}>
                <img
                  src={item.image}
                  alt=""
                  className={cn(
                    "aspect-[16/9] size-full object-cover",
                    item.object
                  )}
                />
              </figure>
              <div className="mt-4 space-y-1">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {t(`cases.${item.key}.route`)}
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
