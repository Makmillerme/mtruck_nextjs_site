import CatalogBlock from "@/components/catalog/CatalogBlock";
import Hero from "@/components/home/Hero";
import ContactSection from "@/components/contact-section";
import ServicesSection from "@/components/services-section";

function HomePage() {
  return (
    <>
      <Hero />
      <CatalogBlock />
      <ServicesSection />
      <ContactSection />
    </>
  );
}
export default HomePage;
