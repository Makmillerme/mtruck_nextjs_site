import ShopNavbar from "./ShopNavbar";
import { ensureUserCode } from "@/lib/codes";
import { loadNavbarStaffNotifications } from "@/utils/actions";
import { getSession, getUserRole, isStaffRole } from "@/utils/session";
import type { SessionUser } from "@/utils/session";

async function Navbar() {
  const session = await getSession();
  const role = session?.user?.id ? await getUserRole(session.user.id) : null;
  const userCode = session?.user?.id
    ? await ensureUserCode(session.user.id)
    : null;
  const user = session?.user
    ? ({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role,
        userCode,
      } satisfies SessionUser)
    : null;
  const isAdmin = isStaffRole(role);

  let unreadInquiryCount = 0;
  let notificationItems: {
    id: string;
    kind: "inquiry" | "vehicle-request";
    phone: string;
    productName: string | null;
    productCode: string | null;
    createdAt: string;
  }[] = [];

  if (isAdmin) {
    try {
      const { count, items } = await loadNavbarStaffNotifications();
      unreadInquiryCount = count;
      notificationItems = items.map((item) => ({
        id: item.id,
        kind: item.kind,
        phone: item.phone,
        productName: item.productName,
        productCode: item.productCode,
        createdAt: item.createdAt.toISOString(),
      }));
    } catch {
      unreadInquiryCount = 0;
      notificationItems = [];
    }
  }

  return (
    <ShopNavbar
      user={user}
      isAdmin={isAdmin}
      unreadInquiryCount={unreadInquiryCount}
      notificationItems={notificationItems}
    />
  );
}

export default Navbar;
