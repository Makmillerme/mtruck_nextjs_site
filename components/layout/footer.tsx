import Logo from "@/components/navbar/Logo";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { siteNav } from "@/utils/links";
import { getTranslations } from "next-intl/server";
import { FaTelegram } from "react-icons/fa";
import { LuClock, LuMail, LuMapPin, LuPhone } from "react-icons/lu";

const LEGAL_LINKS = [
  { key: "privacy", href: "/privacy" },
  { key: "terms", href: "/terms" },
] as const;

const TELEGRAM_URL = "https://t.me/mtruck_sales";

const footerNavClass =
  "rounded-md px-3 py-2 text-sm font-medium tracking-wide text-background/80 hover:bg-background/10 hover:text-background";

export default async function Footer() {
  const t = await getTranslations("Footer");
  const tNav = await getTranslations("Navbar");
  const year = new Date().getFullYear();

  return (
    <footer
      data-header-surface="dark"
      className="mt-auto bg-foreground text-background"
    >
      <section aria-label={t("aria")} className="page-container py-8 md:py-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
          <div className="max-w-sm space-y-3">
            <Logo />
            <p className="text-sm leading-relaxed text-background/65">{t("tagline")}</p>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-5 lg:max-w-2xl lg:items-end">
            <nav aria-label={t("navAria")} className="flex flex-wrap items-center gap-1 lg:justify-end">
              {siteNav.map((item) => (
                <Link key={item.href} href={item.href} className={footerNavClass}>
                  {tNav(item.key)}
                </Link>
              ))}
            </nav>

            <ul className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-2 lg:justify-end">
              <li>
                <a href={t("phone.href")} className="inline-flex items-center gap-2.5 text-sm text-background/80 hover:text-background">
                  <LuPhone className="size-5 shrink-0 text-background/80" aria-hidden />
                  {t("phone.value")}
                </a>
              </li>
              <li>
                <a href={t("email.href")} className="inline-flex items-center gap-2.5 text-sm text-background/80 hover:text-background">
                  <LuMail className="size-5 shrink-0 text-background/80" aria-hidden />
                  {t("email.value")}
                </a>
              </li>
              <li className="inline-flex items-start gap-2.5 text-sm text-background/80 sm:items-center">
                <LuMapPin className="mt-0.5 size-5 shrink-0 text-background/80 sm:mt-0" aria-hidden />
                <span className="whitespace-pre-line sm:whitespace-normal">{t("address")}</span>
              </li>
              <li className="inline-flex items-center gap-2.5 text-sm text-background/80">
                <LuClock className="size-5 shrink-0 text-background/80" aria-hidden />
                {t("hours")}
              </li>
            </ul>

            <Button asChild variant="inverse" size="sm">
              <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer">
                <FaTelegram className="size-4" aria-hidden />
                {t("telegramCta")}
              </a>
            </Button>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start gap-3 border-t border-background/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-background/60">{t("copyright", { year })}</p>
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {LEGAL_LINKS.map(({ key, href }) => (
              <li key={key}>
                <Link
                  href={href}
                  className="text-xs text-background/60 transition-colors hover:text-background"
                >
                  {t(`legal.${key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </footer>
  );
}
