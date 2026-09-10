import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { getTranslations } from "next-intl/server";
import type { IconType } from "react-icons";
import {
  LuArrowUpRight,
  LuBanknote,
  LuSettings2,
  LuTruck,
  LuWrench,
} from "react-icons/lu";

const GROUPS = [
  {
    key: "commerce",
    href: "/services#sale",
    items: [
      { key: "sale", icon: LuTruck, index: "01" },
      { key: "finance", icon: LuBanknote, index: "02" },
    ],
  },
  {
    key: "workshop",
    href: "/services#workshop",
    items: [
      { key: "workshop", icon: LuWrench, index: "03" },
      { key: "refit", icon: LuSettings2, index: "04" },
    ],
  },
] as const satisfies ReadonlyArray<{
  key: "commerce" | "workshop";
  href: string;
  items: ReadonlyArray<{
    key: "sale" | "finance" | "workshop" | "refit";
    icon: IconType;
    index: string;
  }>;
}>;

export default async function ServicesSection() {
  const t = await getTranslations("ServicesSection");

  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="full-bleed scroll-mt-16 bg-background"
    >
      <div className="page-container py-16 md:py-24">
        <header className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-16">
          <div className="lg:col-span-5">
            <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
              {t("eyebrow")}
            </p>
            <h2
              id="services-heading"
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

        <div className="grid grid-cols-1 lg:grid-cols-2">
          {GROUPS.map((group, groupIndex) => (
            <div
              key={group.key}
              className={cn(
                "flex flex-col gap-10 py-10 lg:gap-12 lg:px-12 lg:py-4",
                groupIndex === 0 &&
                  "border-b border-border lg:border-b-0 lg:border-r lg:pl-0",
                groupIndex === 1 && "lg:pr-0"
              )}
            >
              <div className="flex items-center justify-between gap-4">
                <p className="font-mono text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
                  {t(`groups.${group.key}`)}
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link href={group.href}>
                    {t(`groupsCta.${group.key}`)}
                    <LuArrowUpRight aria-hidden />
                  </Link>
                </Button>
              </div>
              <ul className="flex flex-col divide-y divide-border">
                {group.items.map(({ key, icon: Icon, index }) => (
                  <li key={key} className="flex flex-col gap-4 py-10 first:pt-0 last:pb-0 lg:py-12 lg:first:pt-0 lg:last:pb-0">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm tabular-nums text-foreground">
                        {index}
                      </span>
                      <Icon
                        className="size-4 text-muted-foreground"
                        aria-hidden
                      />
                    </div>
                    <h3 className="text-xl font-black tracking-tight text-foreground lg:text-2xl">
                      {t(`items.${key}.title`)}
                    </h3>
                    <p className="max-w-md text-sm leading-relaxed text-muted-foreground lg:text-base">
                      {t(`items.${key}.description`)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
