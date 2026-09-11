import Sidebar from "./Sidebar";
import { getAdminUser } from "@/utils/session";

async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await getAdminUser();
  return (
    <section className="grid gap-8 pb-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
      <Sidebar />
      <div className="min-w-0">{children}</div>
    </section>
  );
}
export default DashboardLayout;
