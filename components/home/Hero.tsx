import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

async function Hero() {
  const t = await getTranslations("HomePage");

  return (
    <section
      id="hero"
      aria-label={t("heroAria")}
      className="full-bleed relative flex min-h-[600px] items-center overflow-hidden lg:min-h-[700px]"
    >
      <div aria-hidden className="absolute inset-0 bg-[#0b1220]">
        <Image
          src="/images/hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[58%_center] lg:object-[72%_center]"
        />
      </div>
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-foreground/85 via-foreground/55 to-transparent md:from-foreground/75 md:via-foreground/35"
      />
      <div className="page-container relative z-10 w-full">
        <div className="flex max-w-2xl flex-col gap-6 lg:gap-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-white/70">
            {t("heroEyebrow")}
          </p>
          <h1 className="text-balance text-4xl font-black leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
            {t("heroTitle")}
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-white/80 md:text-xl">
            {t("heroSubtitle")}
          </p>
          <div className="flex flex-col gap-4 pt-2 sm:flex-row">
            <Button
              asChild
              className="h-12 px-8 text-base font-semibold"
            >
              <a href="#inventory">{t("heroCta")}</a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-12 border-white/50 bg-transparent px-8 text-base font-semibold text-white hover:bg-white/10 hover:text-white"
            >
              <a href="#partners">{t("heroSecondary")}</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
