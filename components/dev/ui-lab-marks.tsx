"use client";

import { FavoriteHeartPreview } from "@/components/form/Buttons";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FINDER_BRANDS } from "@/lib/home/category-finder";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { LuTag } from "react-icons/lu";

const chipClass = (active: boolean) =>
  cn(
    "shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors",
    active
      ? "border-primary bg-primary text-primary-foreground"
      : "border-border bg-secondary text-muted-foreground hover:border-primary/30 hover:text-foreground"
  );

const STATUS = [
  { key: "PUBLISHED", label: "В наявності", dot: "bg-emerald-500" },
  { key: "RESERVED", label: "Резерв", dot: "bg-amber-500" },
  { key: "PREPARING", label: "Підготовка", dot: "bg-sky-500" },
  { key: "SOLD", label: "Продано", dot: "bg-red-500" },
] as const;

function Crumbs() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Головна</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Каталог</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>MAN TGX 18.440</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default function UiLabMarks() {
  const [brand, setBrand] = useState(FINDER_BRANDS[0]?.id ?? "daf");

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground">Теги · Badge</p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge>default</Badge>
          <Badge variant="secondary">secondary</Badge>
          <Badge variant="outline">outline</Badge>
          <Badge variant="tag">
            <LuTag className="mr-1 size-3.5" aria-hidden />
            MAN
          </Badge>
          <Badge variant="soft">Featured</Badge>
          <Badge variant="destructive">destructive</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS.map((item) => (
            <Badge
              key={item.key}
              variant="secondary"
              className="gap-1.5 rounded-full border-0 bg-background/90 px-2.5 py-1 text-[11px] font-semibold leading-none text-foreground hover:bg-background/90"
            >
              <span className={cn("size-1.5 shrink-0 rounded-full", item.dot)} aria-hidden />
              {item.label}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground">Чіпи підбору</p>
        <div className="flex flex-wrap gap-2">
          {FINDER_BRANDS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={chipClass(brand === item.id)}
              onClick={() => setBrand(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground">Обране</p>
        <p className="text-sm text-muted-foreground">
          Білий диск, idle — muted, збережене — navy (`foreground`), без смарагду й тіні.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-sm border border-border bg-background p-4">
            <FavoriteHeartPreview isFavorite={false} />
            <FavoriteHeartPreview isFavorite />
            <span className="text-xs text-muted-foreground">white</span>
          </div>
          <div className="flex items-center gap-3 rounded-sm bg-secondary p-4">
            <FavoriteHeartPreview isFavorite={false} />
            <FavoriteHeartPreview isFavorite />
            <span className="text-xs text-muted-foreground">pastel</span>
          </div>
          <div className="relative flex items-center gap-3 overflow-hidden rounded-sm bg-muted p-4">
            <img
              src="/images/hero.webp"
              alt=""
              className="absolute inset-0 size-full object-cover opacity-80"
            />
            <div className="relative flex items-center gap-3">
              <FavoriteHeartPreview isFavorite={false} />
              <FavoriteHeartPreview isFavorite />
              <span className="text-xs text-white [text-shadow:0_1px_8px_rgba(6,16,32,0.9)]">
                photo
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground">Breadcrumb</p>
        <div className="rounded-sm border border-border bg-background px-4 py-3">
          <Crumbs />
        </div>
        <div
          data-header-surface="dark"
          className="rounded-sm bg-foreground px-4 py-3 [&_nav]:text-background/55 [&_[aria-current=page]]:text-background"
        >
          <Crumbs />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground">Рисочки · стрілки · кроки</p>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Separator className="w-16" />
            <span className="font-mono text-[10px] uppercase tracking-widest">rule</span>
          </div>
          <div className="flex h-10 items-center gap-2 text-sm text-muted-foreground">
            <Separator orientation="vertical" className="h-8" />
            <span className="font-mono text-[10px] uppercase tracking-widest">tick</span>
          </div>
          <Button>
            Детальніше
            <ChevronRight className="size-4" aria-hidden />
          </Button>
          <Button variant="outline" size="sm">
            Показати пропозиції
            <ChevronRight className="size-4" aria-hidden />
          </Button>
          <span className="flex size-9 items-center justify-center rounded-full border border-foreground/25 font-mono text-xs">
            01
          </span>
        </div>
        <div
          data-header-surface="dark"
          className="flex flex-wrap items-center gap-8 rounded-sm bg-foreground px-6 py-8"
        >
          <span className="flex flex-col items-center gap-2 text-background/50">
            <span className="h-9 w-px bg-background/25" />
            <ChevronDown className="size-4" aria-hidden />
            <span className="font-mono text-[10px] uppercase tracking-widest">hero cue</span>
          </span>
          <span className="flex size-9 items-center justify-center rounded-full border border-background/25 font-mono text-xs text-background">
            01
          </span>
          <Button>
            Залишити заявку
            <ChevronRight className="size-4" aria-hidden />
          </Button>
          <Button variant="inverse">
            Зв'язатися з нами
          </Button>
        </div>
      </div>
    </div>
  );
}
