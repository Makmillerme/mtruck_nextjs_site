import LoadingContainer from "@/components/global/LoadingContainer";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import Hero from "@/components/home/Hero";
import ContactSection from "@/components/contact-section";
import FaqSection from "@/components/faq-section";
import PartnershipSection from "@/components/partnership-section";
import ServicesSection from "@/components/services-section";
import TrustStrip from "@/components/trust-strip";
import { Suspense } from "react";

function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <Suspense fallback={<LoadingContainer />}>
        <FeaturedProducts />
      </Suspense>
      <ServicesSection />
      <FaqSection />
      <ContactSection />
      <PartnershipSection />
    </>
  );
}
export default HomePage;
