import type { Metadata, Viewport } from "next";
import Footer from "@/components/layout/footer";
import Navbar from "@/components/navbar/Navbar";
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
  colorScheme: "light",
  themeColor: "#ffffff",
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
      <Providers>
        <Navbar />
        <main className="min-w-0">
          <div className="page-container min-w-0 has-[.full-bleed]:contents has-[.page-content]:contents">
            {children}
          </div>
        </main>
        <Footer />
      </Providers>
    </NextIntlClientProvider>
  );
}
