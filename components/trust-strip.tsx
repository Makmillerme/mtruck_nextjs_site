import { Card, CardContent } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";
import { Award, Calendar, TruckIcon, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const STATS = [
  { key: "years", icon: Calendar },
  { key: "sold", icon: TruckIcon },
  { key: "clients", icon: Users },
  { key: "import", icon: Award },
] as const satisfies ReadonlyArray<{ key: string; icon: LucideIcon }>;

const BRANDS = ["MAN", "DAF", "Volvo", "Renault", "Scania", "Mercedes"] as const;

export default async function TrustStrip() {
  const t = await getTranslations("TrustStrip");

  return (
    <section
      aria-label={t("aria")}
      className="full-bleed bg-secondary section-spacing-tight"
    >
      <div className="page-container">
        <h2 className="sr-only">{t("title")}</h2>
        <div className="mb-12 grid grid-cols-2 gap-6 md:grid-cols-4 lg:mb-16">
          {STATS.map(({ key, icon: Icon }) => (
            <Card
              key={key}
              className="flex flex-col border-0 bg-background/50 shadow-sm"
            >
              <CardContent className="p-6 text-center">
                <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="size-6 text-primary" aria-hidden />
                </span>
                <p className="font-mono text-3xl font-black text-foreground lg:text-4xl">
                  {t(`stats.${key}.value`)}
                </p>
                <p className="mt-1 text-sm font-normal text-muted-foreground">
                  {t(`stats.${key}.label`)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        <ul
          aria-label={t("brandsAria")}
          className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 lg:gap-12"
        >
          {BRANDS.map((brand) => (
            <li
              key={brand}
              className="text-2xl font-black text-muted-foreground/50 transition-colors hover:text-foreground"
            >
              {brand}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
