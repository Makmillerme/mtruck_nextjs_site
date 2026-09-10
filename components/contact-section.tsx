import ContactForm from "@/components/contact-form";
import { getTranslations } from "next-intl/server";

const FACT_KEYS = ["phone", "email", "address", "hours"] as const;

export default async function ContactSection() {
  const t = await getTranslations("ContactSection");

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="full-bleed scroll-mt-16 bg-secondary"
    >
      <div className="page-container py-16 md:py-24">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
              {t("eyebrow")}
            </p>
            <h2
              id="contact-heading"
              className="text-balance text-3xl font-black tracking-tight text-foreground md:text-4xl lg:text-[2.75rem] lg:leading-[1.12]"
            >
              {t("title")}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground lg:text-lg">
              {t("subtitle")}
            </p>
            <div className="mt-8">
              <ContactForm />
            </div>
          </div>

          <ul className="grid gap-8 sm:grid-cols-2">
            {FACT_KEYS.map((key) => {
              const label = t(`${key}.label`);
              const value = t(`${key}.value`);
              const href =
                key === "phone" || key === "email" ? t(`${key}.href`) : null;

              return (
                <li key={key} className="min-w-0">
                  <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {label}
                  </p>
                  {href ? (
                    <a
                      href={href}
                      className="block whitespace-pre-line text-sm font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="whitespace-pre-line text-sm font-medium text-foreground">
                      {value}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
