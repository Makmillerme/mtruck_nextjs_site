import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import UiLabBlocks from "@/components/dev/ui-lab-blocks";
import UiLab from "@/components/dev/ui-lab";

export const metadata: Metadata = {
  title: "UI Lab",
  robots: { index: false, follow: false },
};

export default async function UiLabPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <UiLab>
      <UiLabBlocks />
    </UiLab>
  );
}
