import Sidebar from "./Sidebar";
import { getStaffUser, isAdminRole } from "@/utils/session";

async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { role } = await getStaffUser();
  return (
    <section className="grid min-h-0 w-full min-w-0 flex-1 grid-cols-1 gap-8 pb-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
      <Sidebar isAdmin={isAdminRole(role)} />
      <div className="min-w-0 w-full">{children}</div>
    </section>
  );
}
export default DashboardLayout;
