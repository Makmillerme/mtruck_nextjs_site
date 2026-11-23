import { cookies } from "next/headers";
import { BUYER_CURRENCY_COOKIE } from "@/lib/finance/buyer-currency-cookie";

export { BUYER_CURRENCY_COOKIE };

export async function getBuyerCurrencyCookie(): Promise<string | null> {
  const jar = await cookies();
  const value = jar.get(BUYER_CURRENCY_COOKIE)?.value?.trim().toUpperCase();
  return value && /^[A-Z]{3}$/.test(value) ? value : null;
}
