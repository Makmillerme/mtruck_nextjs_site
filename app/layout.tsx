import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@teispace/next-themes";
import { getTheme, getThemeScript } from "@teispace/next-themes/server";
import { routing } from "@/i18n/routing";

const geistSans = Geist({
  subsets: ["latin", "cyrillic"],
  variable: "--font-geist-sans",
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
  const [initialTheme, htmlLang] = await Promise.all([
    getTheme(),
    getHtmlLang(),
  ]);
  const themeScript = getThemeScript({
    attribute: "class",
    defaultTheme: "system",
    enableSystem: true,
    initialTheme: initialTheme ?? undefined,
  });

  return (
    <html
      lang={htmlLang}
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          initialTheme={initialTheme ?? undefined}
          noScript
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
