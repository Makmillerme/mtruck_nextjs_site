import ShopNavbar from "./ShopNavbar";
import { getSession } from "@/utils/session";
import type { SessionUser } from "@/utils/session";

async function Navbar() {
  const session = await getSession();
  const user = session?.user
    ? ({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      } satisfies SessionUser)
    : null;
  return <ShopNavbar user={user} />;
}

export default Navbar;
