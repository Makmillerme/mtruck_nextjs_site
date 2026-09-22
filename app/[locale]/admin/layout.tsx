import { Suspense } from "react";
import Sidebar from "./Sidebar";
import { fetchTaxonomyTree } from "@/lib/catalog/taxonomy";
import { getStaffUser, isAdminRole } from "@/utils/session";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

async function AdminSidebar({ isAdmin }: { isAdmin: boolean }) {
  const tree = await fetchTaxonomyTree();
  const productRoots = tree.map((node) => ({
    id: node.id,
    name: node.name,
  }));
  return <Sidebar isAdmin={isAdmin} productRoots={productRoots} />;
}

function SidebarFallback() {
  return (
    <aside className="min-w-0">
      <Card className="sticky top-16 max-h-[calc(100vh-5rem)] overflow-y-auto shadow-sm lg:top-[4.5rem] lg:max-h-[calc(100vh-6rem)]">
        <CardContent className="grid gap-1 p-3">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </CardContent>
      </Card>
    </aside>
  );
}

async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { role } = await getStaffUser();
  const isAdmin = isAdminRole(role);

  return (
    <section className="grid min-h-0 w-full min-w-0 flex-1 grid-cols-1 gap-8 pb-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
      <Suspense fallback={<SidebarFallback />}>
        <AdminSidebar isAdmin={isAdmin} />
      </Suspense>
      <div className="min-w-0 w-full">{children}</div>
    </section>
  );
}
export default DashboardLayout;
