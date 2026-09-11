import { headers } from "next/headers";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
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
      data-scroll-behavior="auto"
      className={`${plusJakarta.variable} ${geistMono.variable} light`}
      suppressHydrationWarning
    >
      <body className="flex min-h-dvh flex-col font-sans antialiased" suppressHydrationWarning>
        <Script id="mtruck-boot" strategy="beforeInteractive">
          {`try{if("scrollRestoration" in history)history.scrollRestoration="manual"}catch(e){}
document.documentElement.setAttribute("data-scroll-behavior","auto");
window.addEventListener("pageshow",function(){requestAnimationFrame(function(){document.documentElement.setAttribute("data-scroll-behavior","smooth")})});`}
        </Script>
        <ThemeProvider
          attribute="class"
          forcedTheme="light"
          defaultTheme="light"
          enableSystem={false}
          enableColorScheme={false}
          storage="none"
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
