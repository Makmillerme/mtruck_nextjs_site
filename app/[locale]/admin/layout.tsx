import { Separator } from "@/components/ui/separator";
import Sidebar from "./Sidebar";
import { getAdminUser } from "@/utils/session";
import { getTranslations } from "next-intl/server";

async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await getAdminUser();
  const t = await getTranslations("Admin");
  return (
    <div className="grid gap-8">
      <div className="grid gap-3">
        <h2 className="text-xl font-semibold">{t("dashboard")}</h2>
        <Separator />
      </div>
      <section className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <Sidebar />
        <div className="min-w-0">{children}</div>
      </section>
    </div>
  );
}
export default DashboardLayout;
