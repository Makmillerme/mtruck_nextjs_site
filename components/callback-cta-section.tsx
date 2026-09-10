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
      <div className="page-container py-12 md:py-16">
        <div className="mx-auto max-w-2xl">
          <header className="mb-8">
            <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
              {t("eyebrow")}
            </p>
            <h2
              id="contact-heading"
              className="text-balance text-3xl font-black tracking-tight text-foreground md:text-4xl"
            >
              {t("title")}
            </h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
              {t("subtitle")}
            </p>
          </header>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
