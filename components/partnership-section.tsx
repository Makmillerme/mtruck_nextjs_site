import PartnershipForm from "@/components/partnership-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";
import { Globe, Handshake, ShieldCheck, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const BENEFITS = [
  { key: "network", icon: Globe },
  { key: "quality", icon: ShieldCheck },
  { key: "logistics", icon: Truck },
  { key: "cooperation", icon: Handshake },
] as const satisfies ReadonlyArray<{ key: string; icon: LucideIcon }>;

export default async function PartnershipSection() {
  const t = await getTranslations("PartnershipSection");

  return (
    <section
      id="partners"
      aria-labelledby="partners-heading"
      data-header-surface="dark"
      className="full-bleed section-spacing scroll-mt-16 bg-foreground"
    >
      <div className="page-container grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="space-y-10">
          <header>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
              {t("eyebrow")}
            </p>
            <h2
              id="partners-heading"
              className="text-balance text-3xl font-black leading-tight text-background lg:text-4xl"
            >
              {t("title")}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-background/70">
              {t("subtitle")}
            </p>
          </header>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            {BENEFITS.map(({ key, icon: Icon }) => (
              <Card
                key={key}
                className="border-background/10 bg-background/5 shadow-sm"
              >
                <CardContent className="flex items-start gap-4 p-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/20">
                    <Icon className="size-5 text-primary" aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-semibold text-background">
                      {t(`benefits.${key}.title`)}
                    </h3>
                    <p className="mt-1 text-sm text-background/60">
                      {t(`benefits.${key}.description`)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <Card className="border-background/10 bg-background/5 shadow-sm">
          <CardHeader>
            <CardTitle className="text-background">{t("formTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <PartnershipForm />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
