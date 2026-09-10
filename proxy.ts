import createIntlMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { routing } from "./i18n/routing";

const handleI18nRouting = createIntlMiddleware(routing);

const protectedPaths = ["/admin", "/account", "/orders", "/user-profile", "/favorites"];
const prefixedLocales = new Set(
  routing.locales.filter((locale) => locale !== routing.defaultLocale)
);

function stripLocalePrefix(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const maybeLocale = segments[0];

  if (maybeLocale && prefixedLocales.has(maybeLocale as (typeof routing.locales)[number])) {
    return {
      locale: maybeLocale,
      pathname: "/" + segments.slice(1).join("/"),
    };
  }

  return {
    locale: routing.defaultLocale,
    pathname: pathname === "" ? "/" : pathname,
  };
}

function isProtected(pathname: string) {
  return protectedPaths.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function signInPath(locale: string) {
  if (locale === routing.defaultLocale) {
    return "/sign-in";
  }
  return `/${locale}/sign-in`;
}

export async function proxy(request: NextRequest) {
  const { locale, pathname } = stripLocalePrefix(request.nextUrl.pathname);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-mtruck-pathname", pathname || "/");
  const intlRequest = new NextRequest(request, { headers: requestHeaders });
  const response = handleI18nRouting(intlRequest);

  if (!isProtected(pathname)) {
    return response;
  }

  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    const signInUrl = new URL(signInPath(locale), request.url);
    signInUrl.searchParams.set("redirect_url", request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
