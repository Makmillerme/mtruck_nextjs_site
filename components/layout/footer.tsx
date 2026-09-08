import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { FaTelegram } from "react-icons/fa";

const CATALOG_LINKS = [
  { key: "tractors", href: "/products" },
  { key: "vans", href: "/products" },
  { key: "reefers", href: "/products" },
  { key: "all", href: "/products" },
] as const;

const COMPANY_LINKS = [
  { key: "about", href: "/about" },
  { key: "services", href: "/services" },
  { key: "partnership", href: "/partnership" },
  { key: "contacts", href: "/contact" },
] as const;

const LEGAL_LINKS = [
  { key: "privacy", href: "/privacy" },
  { key: "terms", href: "/terms" },
] as const;

const TELEGRAM_URL = "https://t.me/mtruck_sales";

export default async function Footer() {
  const t = await getTranslations("Footer");
  const year = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background">
      <section
        aria-label={t("aria")}
        className="page-container section-spacing"
      >
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          <div className="space-y-6">
            <Link
              href="/"
              className="inline-block text-2xl font-black tracking-tight"
            >
              <span className="text-background">M-</span>
              <span className="text-primary">TRUCK</span>
            </Link>
            <p className="text-sm text-background/70">{t("tagline")}</p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm">
                <Phone className="size-4 shrink-0 text-primary" aria-hidden />
                <a
                  href={t("phone.href")}
                  className="text-background/70 hover:text-primary"
                >
                  {t("phone.value")}
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Mail className="size-4 shrink-0 text-primary" aria-hidden />
                <a
                  href={t("email.href")}
                  className="text-background/70 hover:text-primary"
                >
                  {t("email.value")}
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <MapPin
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden
                />
                <span className="whitespace-pre-line text-background/70">
                  {t("address")}
                </span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Clock className="size-4 shrink-0 text-primary" aria-hidden />
                <span className="text-background/70">{t("hours")}</span>
              </li>
            </ul>
          </div>

          <nav aria-labelledby="footer-catalog-heading">
            <h3
              id="footer-catalog-heading"
              className="mb-4 font-bold text-background"
            >
              {t("catalogTitle")}
            </h3>
            <ul className="space-y-2">
              {CATALOG_LINKS.map(({ key, href }) => (
                <li key={key}>
                  <Link
                    href={href}
                    className="text-sm text-background/70 hover:text-primary"
                  >
                    {t(`catalog.${key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-company-heading">
            <h3
              id="footer-company-heading"
              className="mb-4 font-bold text-background"
            >
              {t("companyTitle")}
            </h3>
            <ul className="space-y-2">
              {COMPANY_LINKS.map(({ key, href }) => (
                <li key={key}>
                  <Link
                    href={href}
                    className="text-sm text-background/70 hover:text-primary"
                  >
                    {t(`company.${key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="mb-4 font-bold text-background">
              {t("socialTitle")}
            </h3>
            <p className="mb-4 text-sm text-background/70">{t("socialText")}</p>
            <Button asChild>
              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaTelegram className="mr-2 size-5" aria-hidden />
                {t("telegramCta")}
              </a>
            </Button>
          </div>
        </div>

        <Separator className="my-12 bg-background/10" />

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between sm:items-center">
          <p className="text-sm text-background/50">
            {t("copyright", { year })}
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-6">
            {LEGAL_LINKS.map(({ key, href }) => (
              <li key={key}>
                <Link
                  href={href}
                  className="text-sm text-background/50 hover:text-primary"
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
