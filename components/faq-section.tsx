import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getTranslations } from "next-intl/server";

const FAQ_KEYS = ["customs", "vat", "delivery", "inspection"] as const;

export default async function FaqSection() {
  const t = await getTranslations("FaqSection");

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="full-bleed section-spacing scroll-mt-16 bg-secondary"
    >
      <div className="page-container">
        <header className="mx-auto mb-12 max-w-2xl text-center lg:mb-16">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
            {t("eyebrow")}
          </p>
          <h2
            id="faq-heading"
            className="text-3xl font-black tracking-tight text-foreground lg:text-4xl"
          >
            {t("title")}
          </h2>
          <p className="mt-4 text-base text-muted-foreground lg:text-lg">
            {t("subtitle")}
          </p>
        </header>
        <Accordion
          type="single"
          collapsible
          className="mx-auto max-w-3xl space-y-4"
        >
          {FAQ_KEYS.map((key) => (
            <AccordionItem
              key={key}
              value={key}
              className="rounded-lg border border-border bg-background px-6 data-[state=open]:border-primary"
            >
              <AccordionTrigger className="py-5 font-semibold text-foreground hover:text-primary hover:no-underline">
                {t(`items.${key}.question`)}
              </AccordionTrigger>
              <AccordionContent className="pb-5 leading-relaxed text-muted-foreground">
                {t(`items.${key}.answer`)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
