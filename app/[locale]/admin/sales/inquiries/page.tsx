import AdminInquiriesView from "@/components/admin/sales/admin-inquiries-view";
import { fetchAdminCallbackInquiries } from "@/utils/actions";
import { getLocale } from "next-intl/server";

async function AdminInquiriesPage() {
  const [locale, items] = await Promise.all([
    getLocale(),
    fetchAdminCallbackInquiries(),
  ]);

  return (
    <AdminInquiriesView
      locale={locale}
      items={items.map((item) => ({
        id: item.id,
        phone: item.phone,
        note: item.note,
        productId: item.productId,
        productName: item.productName ?? item.product?.name ?? null,
        productCode: item.productCode ?? item.product?.productCode ?? null,
        status: item.status,
        readAt: item.readAt?.toISOString() ?? null,
        createdAt: item.createdAt.toISOString(),
      }))}
    />
  );
}

export default AdminInquiriesPage;
