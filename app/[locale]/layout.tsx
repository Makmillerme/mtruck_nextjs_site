import type { Metadata, Viewport } from "next";
import Footer from "@/components/layout/footer";
import Navbar from "@/components/navbar/Navbar";
import HtmlLang from "@/components/global/HtmlLang";
import Providers from "../providers";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: {
      default: t("title"),
      template: `%s | MTruck`,
    },
    description: t("description"),
    icons: {
      icon: [{ url: "/favicon_mtruck.svg", type: "image/svg+xml" }],
      shortcut: "/favicon_mtruck.svg",
      apple: "/favicon_mtruck.svg",
    },
  };
}

export const viewport: Viewport = {
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <HtmlLang />
      <Providers>
        <Navbar />
        <main className="min-w-0 overflow-x-clip pb-16 [&:not(:has(#hero))]:pt-10">
          <div className="page-container min-w-0 has-[.full-bleed]:contents">
            {children}
          </div>
        </main>
        <Footer />
      </Providers>
    </NextIntlClientProvider>
  );
}
