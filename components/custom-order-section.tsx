import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import type { IconType } from "react-icons";
import {
  LuClipboardList,
  LuSearch,
  LuShieldCheck,
  LuTruck,
} from "react-icons/lu";

const STEPS = [
  { key: "request", icon: LuClipboardList },
  { key: "sourcing", icon: LuSearch },
  { key: "deal", icon: LuShieldCheck },
  { key: "delivery", icon: LuTruck },
] as const satisfies ReadonlyArray<{
  key: "request" | "sourcing" | "deal" | "delivery";
  icon: IconType;
}>;

export default async function CustomOrderSection() {
  const t = await getTranslations("CustomOrderSection");

  return (
    <section
      id="custom-order"
      aria-labelledby="custom-order-heading"
      data-header-surface="dark"
      className="full-bleed scroll-mt-16 bg-foreground text-background"
    >
      <div className="page-container py-16 md:py-24">
        <header className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-16">
          <div className="lg:col-span-5">
            <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.22em] text-background/60">
              {t("eyebrow")}
            </p>
            <h2
              id="custom-order-heading"
              className="text-balance text-3xl font-black tracking-tight text-background md:text-4xl lg:text-[2.75rem] lg:leading-[1.12]"
            >
              {t("title")}
            </h2>
          </div>
          <p className="max-w-xl text-base leading-relaxed text-background/70 lg:col-span-7 lg:justify-self-end lg:text-lg">
            {t("subtitle")}
          </p>
        </header>

        <ol className="mt-16 flex flex-col divide-y divide-background/10 lg:mt-20 lg:flex-row lg:divide-x lg:divide-y-0">
          {STEPS.map(({ key, icon: Icon }, index) => (
            <li
              key={key}
              className="flex flex-1 flex-col gap-4 py-8 lg:px-8 lg:py-0 lg:first:pl-0 lg:last:pr-0"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm tabular-nums text-background">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <Icon className="size-4 text-background/60" aria-hidden />
              </div>
              <h3 className="text-lg font-black tracking-tight text-background lg:text-xl">
                {t(`steps.${key}.title`)}
              </h3>
              <p className="text-sm leading-relaxed text-background/70">
                {t(`steps.${key}.description`)}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-14 flex justify-center lg:mt-16">
          <Button asChild size="lg">
            <a href="#contact">{t("cta")}</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
