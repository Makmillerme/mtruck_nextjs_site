import CatalogBlock from "@/components/catalog/CatalogBlock";
import Hero from "@/components/home/Hero";
import CallbackCtaSection from "@/components/callback-cta-section";
import CustomOrderSection from "@/components/custom-order-section";
import SalesCasesSection from "@/components/sales-cases-section";
import ServicesSection from "@/components/services-section";
import { Suspense } from "react";

function CatalogFallback() {
  return (
    <section className="full-bleed bg-secondary" aria-hidden>
      <div className="page-container min-h-[40rem] py-16 md:py-24" />
    </section>
  );
}

function HomePage() {
  return (
    <>
      <Hero />
      <Suspense fallback={<CatalogFallback />}>
        <CatalogBlock />
      </Suspense>
      <ServicesSection />
      <CustomOrderSection />
      <SalesCasesSection />
      <CallbackCtaSection />
    </>
  );
}
export default HomePage;
