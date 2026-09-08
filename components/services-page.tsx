import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import {
  Clock,
  Coins,
  FileCheck,
  Globe,
  Shield,
  Truck,
  Users,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const SERVICES = [
  { key: "customs", icon: FileCheck },
  { key: "maintenance", icon: Wrench },
  { key: "leasing", icon: Coins },
  { key: "delivery", icon: Truck },
] as const satisfies ReadonlyArray<{
  key: "customs" | "maintenance" | "leasing" | "delivery";
  icon: LucideIcon;
}>;

const FEATURE_KEYS = ["f1", "f2", "f3", "f4"] as const;

const ADVANTAGES = [
  { key: "guarantee", icon: Shield },
  { key: "speed", icon: Clock },
  { key: "support", icon: Users },
  { key: "europe", icon: Globe },
] as const satisfies ReadonlyArray<{
  key: "guarantee" | "speed" | "support" | "europe";
  icon: LucideIcon;
}>;

export default async function ServicesPageContent() {
  const t = await getTranslations("ServicesPage");

  return (
    <div className="page-content">
      <header className="mx-auto mb-16 max-w-3xl text-center">
        <h1 className="mb-4 text-4xl font-black tracking-tight text-foreground">
          {t("title")}
        </h1>
        <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
      </header>

      <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-2">
        {SERVICES.map(({ key, icon: Icon }) => (
          <Card
            key={key}
            className="h-full border-border bg-card shadow-sm"
          >
            <CardHeader>
              <span className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="size-6 text-primary" aria-hidden />
              </span>
              <CardTitle className="text-xl">{t(`services.${key}.title`)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {t(`services.${key}.description`)}
              </p>
              <ul className="space-y-2">
                {FEATURE_KEYS.map((featureKey) => (
                  <li
                    key={featureKey}
                    className="flex items-center gap-2 text-sm text-foreground"
                  >
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                      aria-hidden
                    />
                    {t(`services.${key}.features.${featureKey}`)}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <section
        aria-labelledby="services-advantages-heading"
        className="mb-16 rounded-2xl bg-secondary p-8 lg:p-12"
      >
        <h2
          id="services-advantages-heading"
          className="mb-8 text-center text-2xl font-bold text-foreground"
        >
          {t("advantagesTitle")}
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ADVANTAGES.map(({ key, icon: Icon }) => (
            <div key={key} className="text-center">
              <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
                <Icon className="size-6 text-primary" aria-hidden />
              </span>
              <h3 className="mb-2 font-semibold text-foreground">
                {t(`advantages.${key}.title`)}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t(`advantages.${key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="text-center" aria-labelledby="services-cta-heading">
        <h2
          id="services-cta-heading"
          className="mb-4 text-2xl font-bold text-foreground"
        >
          {t("ctaTitle")}
        </h2>
        <p className="mb-6 text-muted-foreground">{t("ctaSubtitle")}</p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/products">{t("ctaCatalog")}</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/contact">{t("ctaContact")}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
