"use client";

import AccountEmptyState from "@/components/account/AccountEmptyState";
import AccountOrdersView, {
  type AccountOrderRow,
} from "@/components/account/account-orders-view";
import AccountSettingsForms from "@/components/account/AccountSettingsForms";
import { ConfirmDeleteCallbackIcon } from "@/components/form/ConfirmDelete";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductCard, {
  type ProductCardModel,
} from "@/components/products/product-card";
import { SoftNavPending } from "@/components/soft-nav/soft-nav";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useOptimisticListRemove } from "@/lib/admin/optimistic-list";
import { notify } from "@/lib/ui/notify";
import {
  clearAllUserFavoritesAction,
  toggleFavoriteAction,
} from "@/utils/actions";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { LuHeart } from "react-icons/lu";

export type AccountCabinetTab = "orders" | "favorites" | "settings";

/** Favorite row with server-resolved ProductCard (layouts + locale). */
export type AccountFavoriteRow = {
  id: string;
  productId: string;
  product: ProductCardModel;
};

export type AccountSettingsProps = {
  name: string;
  email: string;
  image: string | null;
  phone: string | null;
  canChangePassword: boolean;
};

function accountHref(
  tab: AccountCabinetTab,
  sheet?: { create?: boolean }
) {
  const params = new URLSearchParams();
  params.set("tab", tab);
  if (sheet?.create) params.set("create", "1");
  return `/account?${params.toString()}`;
}

function AccountFavoritesPanel({
  favorites,
}: {
  favorites: AccountFavoriteRow[];
}) {
  const t = useTranslations("AccountCabinet");
  const pathname = usePathname();
  const router = useRouter();
  const { optimisticItems, removeOptimistically } =
    useOptimisticListRemove(favorites);

  if (optimisticItems.length === 0) {
    return (
      <AccountEmptyState
        icon={LuHeart}
        title={t("favoritesEmptyTitle")}
        description={t("favoritesEmptyDesc")}
        actionLabel={t("browseCatalog")}
      />
    );
  }

  return (
    <div className="grid w-full min-w-0 grid-cols-1 gap-3">
      <div className="flex flex-wrap items-center gap-x-1.5 text-sm text-muted-foreground">
        <p>{t("favoritesTotal", { count: optimisticItems.length })}</p>
        <span aria-hidden>·</span>
        <ConfirmDeleteCallbackIcon
          label={t("removeAllFavorites")}
          title={t("removeAllFavoritesTitle")}
          description={t("removeAllFavoritesDescription")}
          confirmLabel={t("removeAllFavorites")}
          className="h-auto cursor-pointer gap-1 px-0 py-0 text-sm font-normal text-muted-foreground hover:bg-transparent hover:text-foreground"
          iconClassName="size-3.5"
          onConfirm={async () => {
            const result = await clearAllUserFavoritesAction();
            if (result.message) notify.fromAction(result);
            if (result.ok) router.refresh();
          }}
        />
      </div>
      {/* Full-width cabinet (no filter sidebar): denser than catalog — 1→2→3→4 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
        {optimisticItems.map((favorite, index) => (
          <div
            key={favorite.id}
            className="relative animate-in fade-in duration-300 fill-mode-both"
            style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
          >
            <ProductCard
              product={favorite.product}
              priority={index < 3}
              favoriteId={favorite.id}
              isAuthenticated
              showFavorite={false}
              imageSizes="(max-width: 640px) 100vw, (max-width: 767px) 50vw, (max-width: 1279px) 33vw, 25vw"
            />
            <div className="absolute right-2.5 top-2.5 z-10 sm:right-3 sm:top-3">
              <ConfirmDeleteCallbackIcon
                className="rounded-full border border-border bg-background/90 text-muted-foreground shadow-sm backdrop-blur-sm hover:bg-background"
                onConfirm={() =>
                  removeOptimistically(favorite.id, () =>
                    toggleFavoriteAction({
                      productId: favorite.productId,
                      favoriteId: favorite.id,
                      pathname,
                    })
                  )
                }
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AccountCabinetView({
  tab,
  locale,
  orders,
  favorites,
  settings,
  createOpen,
}: {
  tab: AccountCabinetTab;
  locale: string;
  orders: AccountOrderRow[];
  favorites: AccountFavoriteRow[];
  settings: AccountSettingsProps | null;
  createOpen: boolean;
}) {
  const t = useTranslations("AccountCabinet");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function setTab(value: string) {
    const next: AccountCabinetTab =
      value === "favorites" || value === "settings" ? value : "orders";
    if (next === tab) return;
    startTransition(() => {
      router.replace(accountHref(next));
    });
  }

  function onSheetUrlChange(sheet: { create?: boolean }) {
    startTransition(() => {
      router.replace(accountHref("orders", sheet));
    });
  }

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList className="mb-6 w-full sm:w-full" aria-label={t("navLabel")}>
        <TabsTrigger value="orders" className="sm:flex-1">
          {t("orders")}
        </TabsTrigger>
        <TabsTrigger value="favorites" className="sm:flex-1">
          {t("favorites")}
        </TabsTrigger>
        <TabsTrigger value="settings" className="sm:flex-1">
          {t("settings")}
        </TabsTrigger>
      </TabsList>

      <SoftNavPending isPending={isPending}>
        <TabsContent value="orders" className="mt-0">
          <AccountOrdersView
            locale={locale}
            items={orders}
            createOpen={createOpen && tab === "orders"}
            onSheetUrlChange={onSheetUrlChange}
          />
        </TabsContent>
        <TabsContent value="favorites" className="mt-0">
          <AccountFavoritesPanel favorites={favorites} />
        </TabsContent>
        <TabsContent value="settings" className="mt-0">
          {settings ? <AccountSettingsForms {...settings} /> : null}
        </TabsContent>
      </SoftNavPending>
    </Tabs>
  );
}
