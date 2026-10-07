import UiEditorStubPanel from "@/components/admin/ui-editor/ui-editor-stub-panel";
import UiEditorTabs from "@/components/admin/ui-editor/ui-editor-tabs";
import { parseUiEditorTab } from "@/lib/admin/ui-editor-tab";
import { getTranslations } from "next-intl/server";
import { getAdminUser } from "@/utils/session";

async function AdminUiEditorPage(props: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await getAdminUser();
  const searchParams = await props.searchParams;
  const t = await getTranslations("UiEditor");
  const tab = parseUiEditorTab(searchParams.tab);

  return (
    <section className="grid w-full min-w-0 grid-cols-1 gap-6">
      <UiEditorTabs
        tab={tab}
        filter={
          <UiEditorStubPanel
            title={t("tabFilter")}
            description={t("stubFilter")}
          />
        }
        cardPreview={
          <UiEditorStubPanel
            title={t("tabCardPreview")}
            description={t("stubCardPreview")}
          />
        }
        productCard={
          <UiEditorStubPanel
            title={t("tabProductCard")}
            description={t("stubProductCard")}
          />
        }
        layout={
          <UiEditorStubPanel
            title={t("tabLayout")}
            description={t("stubLayout")}
          />
        }
      />
    </section>
  );
}

export default AdminUiEditorPage;
