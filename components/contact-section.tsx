import ContactForm from "@/components/contact-form";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getTranslations } from "next-intl/server";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const CONTACT_ITEMS = [
  { key: "phone", icon: Phone, href: true, mono: true },
  { key: "email", icon: Mail, href: true, mono: false },
  { key: "address", icon: MapPin, href: false, mono: false },
  { key: "hours", icon: Clock, href: false, mono: false },
] as const satisfies ReadonlyArray<{
  key: "phone" | "email" | "address" | "hours";
  icon: LucideIcon;
  href: boolean;
  mono: boolean;
}>;

export default async function ContactSection() {
  const t = await getTranslations("ContactSection");

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="full-bleed section-spacing scroll-mt-16 border-t border-border bg-background"
    >
      <div className="page-container grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="space-y-6">
          <header>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
              {t("eyebrow")}
            </p>
            <h2
              id="contact-heading"
              className="text-3xl font-black tracking-tight text-foreground lg:text-4xl"
            >
              {t("title")}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground lg:text-lg">
              {t("subtitle")}
            </p>
          </header>
          <ContactForm />
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="mb-6 text-xl font-bold text-foreground">
              {t("infoTitle")}
            </h3>
            <ul className="space-y-4">
              {CONTACT_ITEMS.map(({ key, icon: Icon, href, mono }) => {
                const value = t(`${key}.value`);
                const label = t(`${key}.label`);
                const link = href ? t(`${key}.href`) : null;

                return (
                  <li key={key}>
                    <Card className="border-0 bg-secondary/30 shadow-none">
                      <CardContent className="flex items-start gap-4 p-4">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="size-5 text-primary" aria-hidden />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm text-muted-foreground">{label}</p>
                          {link ? (
                            <a
                              href={link}
                              className={cn(
                                "font-semibold text-foreground hover:text-primary",
                                mono && "font-mono"
                              )}
                            >
                              {value}
                            </a>
                          ) : (
                            <p
                              className={cn(
                                "whitespace-pre-line font-semibold text-foreground",
                                mono && "font-mono"
                              )}
                            >
                              {value}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </li>
                );
              })}
            </ul>
          </div>

          <Card className="overflow-hidden border-0 shadow-none">
            <CardContent className="p-0">
              <div className="flex aspect-video flex-col items-center justify-center gap-2 bg-secondary text-muted-foreground">
                <MapPin className="size-8 opacity-50" aria-hidden />
                <p className="text-sm">{t("mapPlaceholder")}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
