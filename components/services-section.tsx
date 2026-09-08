import { Card, CardContent } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";
import { Coins, FileCheck, Truck, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const SERVICES = [
  { key: "customs", icon: FileCheck },
  { key: "maintenance", icon: Wrench },
  { key: "leasing", icon: Coins },
  { key: "delivery", icon: Truck },
] as const satisfies ReadonlyArray<{ key: string; icon: LucideIcon }>;

export default async function ServicesSection() {
  const t = await getTranslations("ServicesSection");

  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="full-bleed section-spacing scroll-mt-16 bg-background"
    >
      <div className="page-container">
        <header className="mx-auto mb-12 max-w-2xl text-center lg:mb-16">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
            {t("eyebrow")}
          </p>
          <h2
            id="services-heading"
            className="text-3xl font-black tracking-tight text-foreground lg:text-4xl"
          >
            {t("title")}
          </h2>
          <p className="mt-4 text-base text-muted-foreground lg:text-lg">
            {t("subtitle")}
          </p>
        </header>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {SERVICES.map(({ key, icon: Icon }) => (
            <Card
              key={key}
              className="group text-center shadow-sm transition-all hover:border-primary hover:shadow-lg"
            >
              <CardContent className="p-6">
                <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary">
                  <Icon
                    className="h-7 w-7 text-primary transition-colors group-hover:text-primary-foreground"
                    aria-hidden
                  />
                </span>
                <h3 className="mb-2 text-lg font-bold text-foreground">
                  {t(`items.${key}.title`)}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {t(`items.${key}.description`)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
