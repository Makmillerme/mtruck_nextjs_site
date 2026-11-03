"use client";

import ProductEquipmentList from "@/components/single-product/product-equipment-list";
import ProductSpecs from "@/components/single-product/product-specs";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import type { ProductDetailsTab } from "@/lib/catalog/product-page";
import { cn } from "@/lib/utils";

/** Content / underline tabs — PDP reading card. Framed navy Tabs stay default elsewhere. */
export const contentTabsListClassName =
  "h-auto w-full justify-start gap-6 rounded-none border-0 border-b border-border bg-transparent p-0 sm:w-full";

export const contentTabsTriggerClassName =
  "h-auto min-w-0 flex-none rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pb-3 text-sm font-medium text-muted-foreground shadow-none transition-colors hover:bg-transparent hover:text-foreground data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none sm:flex-none";

export const contentTabsCardClassName =
  "rounded-sm border border-border bg-card p-4 md:p-6";

type ProductDetailsTabsProps = {
  tabs: ProductDetailsTab[];
  /** Fallback heading inside TEXT tabs when body has no own title. */
  textHeading?: string;
  className?: string;
};

export default function ProductDetailsTabs({
  tabs,
  textHeading,
  className,
}: ProductDetailsTabsProps) {
  if (tabs.length === 0) return null;

  const defaultValue = tabs[0]?.id;

  return (
    <div className={cn("w-full scroll-mt-24", className)}>
      <div className={contentTabsCardClassName}>
        <Tabs defaultValue={defaultValue} key={defaultValue}>
          <TabsList className={contentTabsListClassName}>
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={contentTabsTriggerClassName}
              >
                {tab.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent
              key={tab.id}
              value={tab.id}
              className="mt-6 focus-visible:ring-0"
            >
              {tab.kind === "TEXT" ? (
                <div className="grid gap-3">
                  {textHeading ? (
                    <h3 className="text-lg font-bold tracking-tight text-foreground">
                      {textHeading}
                    </h3>
                  ) : null}
                  <p className="whitespace-pre-wrap leading-7 text-foreground/90">
                    {tab.body}
                  </p>
                </div>
              ) : null}

              {tab.kind === "TABLE" ? (
                <ProductSpecs groups={tab.groups} />
              ) : null}

              {tab.kind === "LIST" ? (
                <ProductEquipmentList items={tab.items} />
              ) : null}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
