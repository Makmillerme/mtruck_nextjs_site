"use client";

import ProductSpecs from "@/components/single-product/product-specs";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import type { ProductSpecGroup } from "@/lib/catalog/product-page";
import { cn } from "@/lib/utils";

/** Content / underline tabs — PDP reading card. Framed navy Tabs stay default elsewhere. */
export const contentTabsListClassName =
  "h-auto w-full justify-start gap-6 rounded-none border-0 border-b border-border bg-transparent p-0 sm:w-full";

export const contentTabsTriggerClassName =
  "h-auto min-w-0 flex-none rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pb-3 text-sm font-medium text-muted-foreground shadow-none transition-colors hover:bg-transparent hover:text-foreground data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none sm:flex-none";

export const contentTabsCardClassName =
  "rounded-sm border border-border bg-card p-4 md:p-6";

type ProductDetailsTabsProps = {
  description?: string | null;
  specGroups: ProductSpecGroup[];
  descriptionTab: string;
  specsTab: string;
  aboutTitle: string;
  className?: string;
};

export default function ProductDetailsTabs({
  description,
  specGroups,
  descriptionTab,
  specsTab,
  aboutTitle,
  className,
}: ProductDetailsTabsProps) {
  const trimmed = description?.trim() ?? "";
  const hasDescription = trimmed.length > 0;
  const hasSpecs = specGroups.length > 0;

  if (!hasDescription && !hasSpecs) return null;

  const defaultValue = hasDescription ? "description" : "specs";

  return (
    <div className={cn("w-full scroll-mt-24", className)}>
      <div className={contentTabsCardClassName}>
        <Tabs defaultValue={defaultValue}>
          <TabsList className={contentTabsListClassName}>
            {hasDescription ? (
              <TabsTrigger
                value="description"
                className={contentTabsTriggerClassName}
              >
                {descriptionTab}
              </TabsTrigger>
            ) : null}
            {hasSpecs ? (
              <TabsTrigger
                value="specs"
                className={contentTabsTriggerClassName}
              >
                {specsTab}
              </TabsTrigger>
            ) : null}
          </TabsList>

          {hasDescription ? (
            <TabsContent
              value="description"
              className="mt-6 focus-visible:ring-0"
            >
              <div className="grid gap-3">
                <h3 className="text-lg font-bold tracking-tight text-foreground">
                  {aboutTitle}
                </h3>
                <p className="whitespace-pre-wrap leading-7 text-foreground/90">
                  {trimmed}
                </p>
              </div>
            </TabsContent>
          ) : null}

          {hasSpecs ? (
            <TabsContent value="specs" className="mt-6 focus-visible:ring-0">
              <ProductSpecs groups={specGroups} />
            </TabsContent>
          ) : null}
        </Tabs>
      </div>
    </div>
  );
}
