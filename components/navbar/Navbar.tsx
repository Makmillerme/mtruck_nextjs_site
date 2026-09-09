import ShopNavbar from "./ShopNavbar";
import { getSession, getUserRole, isAdminRole } from "@/utils/session";
import type { SessionUser } from "@/utils/session";

async function Navbar() {
  const session = await getSession();
  const role = session?.user?.id ? await getUserRole(session.user.id) : null;
  const user = session?.user
    ? ({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role,
      } satisfies SessionUser)
    : null;
  const isAdmin = isAdminRole(role);
  return <ShopNavbar user={user} isAdmin={isAdmin} />;
}

export default Navbar;
