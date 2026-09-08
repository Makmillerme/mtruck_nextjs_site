import { headers } from "next/headers";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@teispace/next-themes";
import { routing } from "@/i18n/routing";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext", "vietnamese"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-geist-mono",
  display: "swap",
});

async function getHtmlLang() {
  const headerList = await headers();
  const locale = headerList.get("x-next-intl-locale");
  if (
    locale &&
    routing.locales.includes(locale as (typeof routing.locales)[number])
  ) {
    return locale;
  }
  return routing.defaultLocale;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const htmlLang = await getHtmlLang();

  return (
    <html
      lang={htmlLang}
      data-scroll-behavior="smooth"
      className={`${plusJakarta.variable} ${geistMono.variable} light`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          forcedTheme="light"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
