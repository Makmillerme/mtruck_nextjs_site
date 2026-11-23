"use client";

import { useRouter } from "@/i18n/navigation";
import { BUYER_CURRENCY_COOKIE } from "@/lib/finance/buyer-currency-cookie";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CurrencySwitcher({
  options,
  value,
  className,
}: {
  options: { code: string; label: string }[];
  value: string;
  className?: string;
}) {
  const router = useRouter();

  if (options.length < 2) return null;

  function onChange(next: string) {
    document.cookie = `${BUYER_CURRENCY_COOKIE}=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
    router.refresh();
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        aria-label="Currency"
        className={cn(
          "h-9 w-[4.75rem] border-transparent bg-transparent px-2 shadow-none",
          className
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.code} value={opt.code}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
