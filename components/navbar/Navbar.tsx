import ShopNavbar from "./ShopNavbar";
import { ensureUserCode } from "@/lib/codes";
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
  return <ShopNavbar user={user} isAdmin={isAdmin} />;
}

export default Navbar;
