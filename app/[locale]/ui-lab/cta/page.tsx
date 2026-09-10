import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import UiLabCta from "@/components/dev/ui-lab-cta";

export const metadata: Metadata = {
  title: "CTA Lab",
  robots: { index: false, follow: false },
};

export default async function UiLabCtaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const { locale } = await params;
  setRequestLocale(locale);

  return <UiLabCta />;
}
