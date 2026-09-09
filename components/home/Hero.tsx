import { Button } from "@/components/ui/button";
import heroImage from "@/public/images/hero.png";
import { getTranslations } from "next-intl/server";

async function Hero() {
  const t = await getTranslations("HomePage");

  return (
    <section
      id="hero"
      aria-label={t("heroAria")}
      data-header-surface="dark"
      className="full-bleed relative flex min-h-[600px] items-center overflow-hidden bg-[#061020] lg:min-h-[700px]"
    >
      <div aria-hidden className="absolute inset-0 z-0 bg-[#061020]">
        <link rel="preload" as="image" href={heroImage.src} fetchPriority="high" />
        <img
          src={heroImage.src}
          alt=""
          width={heroImage.width}
          height={heroImage.height}
          fetchPriority="high"
          decoding="async"
          className="hero-photo absolute inset-0 size-full object-cover object-[52%_center] sm:object-[58%_center] md:object-[64%_center] lg:object-[78%_center]"
        />
      </div>
      <div className="page-container relative z-10 w-full">
        <div className="relative flex max-w-2xl flex-col gap-6 lg:gap-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-white/90 [text-shadow:0_1px_18px_rgba(6,16,32,0.85)]">
            {t("heroEyebrow")}
          </p>
          <h1 className="text-balance text-4xl font-black leading-tight tracking-tight text-white [text-shadow:0_2px_24px_rgba(6,16,32,0.9)] md:text-5xl lg:text-6xl">
            {t("heroTitle")}
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-white [text-shadow:0_1px_18px_rgba(6,16,32,0.9)] md:text-xl">
            {t("heroSubtitle")}
          </p>
          <div className="flex flex-col gap-4 pt-2 sm:flex-row">
            <Button
              asChild
              className="h-12 px-8 text-base font-semibold"
            >
              <a href="#catalog">{t("heroCta")}</a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-12 border-white/50 bg-transparent px-8 text-base font-semibold text-white hover:bg-white/10 hover:text-white"
            >
              <a href="#inventory">{t("heroSecondary")}</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
