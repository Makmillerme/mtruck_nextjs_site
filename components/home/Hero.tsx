/* eslint-disable @next/next/no-img-element -- intentional native img + preload for LCP without next/image flash */
import { Button } from "@/components/ui/button";
import heroImage from "@/public/images/hero.webp";
import { getTranslations } from "next-intl/server";
import { ChevronDown } from "lucide-react";
import { preload } from "react-dom";

async function Hero() {
  const t = await getTranslations("HomePage");
  preload(heroImage.src, { as: "image", fetchPriority: "high" });

  return (
    <section
      id="hero"
      aria-label={t("heroAria")}
      data-header-surface="dark"
      className="full-bleed relative -mt-14 flex min-h-[600px] items-center overflow-hidden bg-[#061020] lg:-mt-16 lg:min-h-[700px]"
    >
      <div aria-hidden className="absolute inset-0 z-0 bg-[#061020]">
        <img
          src={heroImage.src}
          alt=""
          width={heroImage.width}
          height={heroImage.height}
          fetchPriority="high"
          decoding="sync"
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
            <Button asChild size="lg">
              <a href="#custom-order">{t("heroCta")}</a>
            </Button>
            <Button asChild variant="inverse" size="lg">
              <a href="#contact">{t("heroSecondary")}</a>
            </Button>
          </div>
        </div>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-6 z-10 hidden justify-center sm:flex lg:bottom-10"
      >
        <span className="flex flex-col items-center gap-2 text-white/50">
          <span className="h-9 w-px bg-white/25" />
          <ChevronDown className="size-4 animate-bounce" />
        </span>
      </div>
    </section>
  );
}

export default Hero;
