"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-11 w-full items-center gap-1 rounded-sm border-2 border-primary bg-card p-1 sm:w-auto",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex h-9 min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-sm border-0 bg-transparent px-3.5 text-xs font-semibold tracking-wide text-primary shadow-none transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-primary hover:text-primary-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:flex-none",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

/** Storefront segment. Quiet border, active ink fill, triggers share the row width. */
export const segmentTabsListClassName =
  "h-10 w-full gap-1 border border-border bg-transparent p-1 sm:w-full";

export const segmentTabsTriggerClassName =
  "h-8 min-w-0 flex-1 px-4 text-foreground hover:bg-muted hover:text-foreground data-[state=active]:bg-foreground data-[state=active]:text-background sm:flex-1";

export { Tabs, TabsList, TabsTrigger, TabsContent }
