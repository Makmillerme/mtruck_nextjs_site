import ContactForm from "@/components/contact-form";
import { getTranslations } from "next-intl/server";

export default async function CallbackCtaSection() {
  const t = await getTranslations("ContactSection");

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="full-bleed scroll-mt-16 bg-secondary"
    >
      <div className="page-container py-16 md:py-24">
        <div className="grid items-end gap-8 lg:grid-cols-12 lg:gap-16">
          <header className="lg:col-span-5">
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
          </header>
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
