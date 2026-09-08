import { Link } from "@/i18n/navigation";
import { Button } from "../ui/button";
import { LuShoppingCart } from "react-icons/lu";
import { fetchCartItems } from "@/utils/actions";
import { getTranslations } from "next-intl/server";

async function CartButton() {
  const t = await getTranslations("Navbar");
  const numItemsInCart = await fetchCartItems();

  return (
    <Button asChild variant="ghost" size="icon" className="relative h-10 w-10">
      <Link href="/cart">
        <LuShoppingCart className="h-6 w-6" />
        <span className="sr-only">{t("cart")}</span>
        {numItemsInCart > 0 ? (
          <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-medium text-background">
            {numItemsInCart}
          </span>
        ) : null}
      </Link>
    </Button>
  );
}
export default CartButton;
