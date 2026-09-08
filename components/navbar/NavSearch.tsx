"use client";
import { Input } from "../ui/input";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useDebouncedCallback } from "use-debounce";
import { useEffect, useState } from "react";
import { LuSearch } from "react-icons/lu";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

function NavSearch({ className }: { className?: string }) {
  const t = useTranslations("Navbar");
  const searchParams = useSearchParams();
  const router = useRouter();
  const paramSearch = searchParams.get("search") ?? "";
  const [search, setSearch] = useState(paramSearch);

  useEffect(() => {
    setSearch(paramSearch);
  }, [paramSearch]);

  const handleSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(
      typeof window === "undefined" ? searchParams.toString() : window.location.search
    );
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    const query = params.toString();
    router.replace(query ? `/products?${query}` : "/products", { scroll: false });
  }, 500);

  return (
    <div className={cn("relative w-full", className)}>
      <LuSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder={t("searchPlaceholder")}
        className="h-12 rounded-full border-0 bg-muted pl-12 text-base shadow-none placeholder:text-muted-foreground focus-visible:ring-0"
        onChange={(e) => {
          setSearch(e.target.value);
          handleSearch(e.target.value);
        }}
        value={search}
      />
    </div>
  );
}
export default NavSearch;
