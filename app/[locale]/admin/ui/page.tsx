import { getTranslations } from "next-intl/server";
import { Card, CardContent } from "@/components/ui/card";
import { getAdminUser } from "@/utils/session";

async function AdminUiEditorPage() {
  await getAdminUser();
  const t = await getTranslations("Admin");

  return (
    <section className="grid w-full min-w-0 grid-cols-1 gap-6">
      <Card className="shadow-sm">
        <CardContent className="grid gap-2 pt-6">
          <h1 className="text-lg font-semibold tracking-tight">
            {t("cmsUiEditor")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("cmsUiEditorStub")}</p>
        </CardContent>
      </Card>
    </section>
  );
}

export default AdminUiEditorPage;
