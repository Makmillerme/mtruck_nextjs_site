import { getTranslations } from "next-intl/server";

type PlaceholderPageKey =
  | "services"
  | "partnership"
  | "faq"
  | "contacts"
  | "privacy"
  | "terms";

export default async function PlaceholderPage({
  page,
}: {
  page: PlaceholderPageKey;
}) {
  const t = await getTranslations(`Pages.${page}`);

  return (
    <section>
      <h1 className="text-3xl font-bold tracking-tight text-[#1e3a5f] md:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
        {t("body")}
      </p>
    </section>
  );
}
