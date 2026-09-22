import { Suspense } from "react";
import Sidebar from "./Sidebar";
import { fetchTaxonomyTree } from "@/lib/catalog/taxonomy";
import { getStaffUser, isAdminRole } from "@/utils/session";

async function AdminSidebar({ isAdmin }: { isAdmin: boolean }) {
  const tree = await fetchTaxonomyTree();
  const productRoots = tree.map((node) => ({
    id: node.id,
    name: node.name,
  }));
  return <Sidebar isAdmin={isAdmin} productRoots={productRoots} />;
}

async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { role } = await getStaffUser();
  const isAdmin = isAdminRole(role);

  return (
    <section className="grid min-h-0 w-full min-w-0 flex-1 grid-cols-1 gap-8 pb-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
      {/* Static nav chrome immediately — never skeleton the aside.
          Product roots stream in when taxonomy resolves. */}
      <Suspense fallback={<Sidebar isAdmin={isAdmin} productRoots={[]} />}>
        <AdminSidebar isAdmin={isAdmin} />
      </Suspense>
      <div className="min-w-0 w-full">{children}</div>
    </section>
  );
}
export default DashboardLayout;
