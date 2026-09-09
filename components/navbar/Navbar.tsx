import ShopNavbar from "./ShopNavbar";
import { getSession, isAdminRole } from "@/utils/session";
import type { SessionUser } from "@/utils/session";

async function Navbar() {
  const session = await getSession();
  const user = session?.user
    ? ({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role:
          "role" in session.user && typeof session.user.role === "string"
            ? session.user.role
            : null,
      } satisfies SessionUser)
    : null;
  const isAdmin = isAdminRole(user?.role);
  return <ShopNavbar user={user} isAdmin={isAdmin} />;
}

export default Navbar;
