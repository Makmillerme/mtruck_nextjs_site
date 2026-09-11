"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LAB_CATEGORIES,
  LAB_SECTION_META,
  matchesLabSection,
  type LabCategoryFilter,
} from "@/components/dev/ui-lab-catalog";
import UiLabButtonSurfaces from "@/components/dev/ui-lab-button-surfaces";
import UiLabIcons from "@/components/dev/ui-lab-icons";
import UiLabHeader from "@/components/dev/ui-lab-header";
import UiLabHomepageClose from "@/components/dev/ui-lab-homepage-close";
import UiLabMarks from "@/components/dev/ui-lab-marks";
import UiLabCascade from "@/components/dev/ui-lab-cascade";
import CategoryFinderPanel from "@/components/catalog/CategoryFinderPanel";
import { cn } from "@/lib/utils";
import {
  LuChevronDown,
  LuInbox,
  LuLoader,
  LuPhone,
  LuSearch,
  LuX,
} from "react-icons/lu";

const BUTTON_VARIANTS = [
  "default",
  "outline",
  "inverse",
  "secondary",
  "ghost",
  "destructive",
  "link",
] as const;

const BUTTON_SIZES = ["sm", "default", "lg"] as const;

function Section({
  id,
  title,
  hint,
  children,
}: {
  id: string;
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="space-y-6 scroll-mt-36">
      <header className="space-y-1">
        <h2 className="text-lg font-bold tracking-tight text-foreground">{title}</h2>
        {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
      </header>
      {children}
    </section>
  );
}

const chipClass = (active: boolean) =>
  cn(
    "shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors",
    active
      ? "border-primary/40 bg-primary/10 text-primary"
      : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground"
  );

function UiLabToolbar({
  query,
  category,
  visibleCount,
  totalCount,
  onQueryChange,
  onCategoryChange,
  onReset,
}: {
  query: string;
  category: LabCategoryFilter;
  visibleCount: number;
  totalCount: number;
  onQueryChange: (value: string) => void;
  onCategoryChange: (value: LabCategoryFilter) => void;
  onReset: () => void;
}) {
  const filtered = query.trim().length > 0 || category !== "all";

  return (
    <div className="sticky top-14 z-40 mt-6 space-y-3 border-b border-border/70 bg-background/95 py-3 backdrop-blur-xl lg:top-16">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <LuSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            autoComplete="off"
            onChange={(event) => onQueryChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape" && query) {
                event.preventDefault();
                onQueryChange("");
              }
            }}
            placeholder="Сердечко, кнопка, breadcrumb…"
            aria-label="Пошук по UI Lab"
            className="h-11 pl-9 pr-10"
          />
          {query ? (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="absolute right-1 top-1/2 size-8 -translate-y-1/2 text-muted-foreground"
              aria-label="Очистити пошук"
              onClick={() => onQueryChange("")}
            >
              <LuX className="size-4" />
            </Button>
          ) : null}
        </div>
        <p className="shrink-0 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {visibleCount} / {totalCount}
        </p>
      </div>

      <div className="flex flex-nowrap items-center gap-2 overflow-x-auto py-0.5 [-ms-overflow-style:none] [scrollbar-width:none] md:flex-wrap md:overflow-visible [&::-webkit-scrollbar]:hidden">
        {LAB_CATEGORIES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={chipClass(category === item.id)}
            onClick={() => onCategoryChange(item.id)}
          >
            {item.label}
          </button>
        ))}
        {filtered ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0"
            onClick={onReset}
          >
            Скинути
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function LabGate({
  id,
  visibleIds,
  children,
}: {
  id: string;
  visibleIds: Set<string>;
  children: ReactNode;
}) {
  if (!visibleIds.has(id)) return null;
  const firstVisible = LAB_SECTION_META.find((section) => visibleIds.has(section.id))?.id;
  return (
    <>
      {firstVisible !== id ? <Separator /> : null}
      {children}
    </>
  );
}

export default function UiLab({ children }: { children?: ReactNode }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<LabCategoryFilter>("all");

  const visibleIds = useMemo(
    () =>
      new Set(
        LAB_SECTION_META.filter((section) =>
          matchesLabSection(section, query, category)
        ).map((section) => section.id)
      ),
    [query, category]
  );

  const reset = () => {
    setQuery("");
    setCategory("all");
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="full-bleed bg-background">
        <div className="page-container py-16 md:py-24">
          <header className="max-w-2xl space-y-3">
            <p className="font-mono text-xs font-medium uppercase tracking-[0.22em] text-primary">
              Dev only
            </p>
            <h1 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">
              UI Lab
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground">
              Канон примітивів, які йдуть на сайт. `default` — navy на світлому, біла
              пластина на hero/navy. У production маршрут віддає 404.
            </p>
          </header>

          <UiLabToolbar
            query={query}
            category={category}
            visibleCount={visibleIds.size}
            totalCount={LAB_SECTION_META.length}
            onQueryChange={setQuery}
            onCategoryChange={setCategory}
            onReset={reset}
          />

          <div className="mt-12 space-y-16 md:mt-16">
          {visibleIds.size === 0 ? (
            <Empty className="border border-dashed border-border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <LuInbox className="size-6" />
                </EmptyMedia>
                <EmptyTitle>Нічого не знайдено</EmptyTitle>
                <EmptyDescription>
                  Змініть запит або категорію — у Lab лишаються лише канонічні блоки.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="outline" size="sm" onClick={reset}>
                  Скинути фільтри
                </Button>
              </EmptyContent>
            </Empty>
          ) : null}

          <LabGate id="logo" visibleIds={visibleIds}>
            <Section
              id="logo"
              title="Лого"
              hint="Ті самі три поверхні, що були в public/logo-preview.html"
            >
              <div className="overflow-hidden rounded-sm border border-border">
                <div className="flex items-center gap-8 bg-background px-8 py-6">
                  <img
                    src="/logo_mtruck.svg?v=flatsteel7"
                    alt="M-TRUCK"
                    className="h-8 w-auto"
                  />
                  <span className="text-xs text-muted-foreground">white · h-8</span>
                </div>
                <div className="flex items-center gap-8 bg-secondary px-8 py-6">
                  <img
                    src="/logo_mtruck.svg?v=flatsteel7"
                    alt=""
                    className="h-10 w-auto"
                  />
                  <span className="text-xs text-muted-foreground">pastel · h-10</span>
                </div>
                <div className="flex items-center gap-8 bg-foreground px-8 py-6">
                  <img
                    src="/logo_mtruck.svg?v=flatsteel7"
                    alt=""
                    className="h-10 w-auto"
                  />
                  <span className="text-xs text-background/60">navy · h-10</span>
                </div>
              </div>
            </Section>
          </LabGate>

          <LabGate id="header" visibleIds={visibleIds}>
            <Section
              id="header"
              title="Header"
              hint="Скло на .site-header-glass, хамелеон на .site-header. Light на white/pastel, dark на photo/navy. Без нижньої риски."
            >
              <UiLabHeader />
            </Section>
          </LabGate>

          <LabGate id="homepage-close" visibleIds={visibleIds}>
            <Section
              id="homepage-close"
              title="Кейси / CTA / футер"
              hint="Триптих-маніфест продажів, CustomOrder CTA по центру, компактна форма 01+03, фрагмент футера на navy."
            >
              <UiLabHomepageClose />
            </Section>
          </LabGate>

          <LabGate id="finder" visibleIds={visibleIds}>
            <Section
              id="finder"
              title="Підбір каталогу"
              hint="Живий CategoryFinder: біла плитка без заголовка. Марка, рік від/до, пробіг від/до, CTA. Наявність — лише в каталозі."
            >
              <div className="rounded-sm bg-secondary p-5 md:p-10">
                <CategoryFinderPanel />
              </div>
            </Section>
          </LabGate>

          <LabGate id="icons" visibleIds={visibleIds}>
            <Section
              id="icons"
              title="Іконки"
              hint="Усі значки з продакшен-коду: lucide, react-icons, Radix. White / pastel / navy. У клітинці — stroke, primary, muted, disk і square. TruckIcon = аліас Truck."
            >
              <UiLabIcons />
            </Section>
          </LabGate>

          <LabGate id="buttons" visibleIds={visibleIds}>
            <Section
              id="buttons"
              title="Button"
              hint="01+03: default = navy fill на white/pastel, біла пластина на hero/navy. Inverse — друга дія на темному. CustomOrder: default по центру, не ghost."
            >
              <UiLabButtonSurfaces />
              <div className="space-y-8">
                {BUTTON_SIZES.map((size) => (
                  <div key={size} className="space-y-3">
                    <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                      size={size}
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      {BUTTON_VARIANTS.filter((v) => v !== "inverse").map((variant) => (
                        <Button key={`${size}-${variant}`} variant={variant} size={size}>
                          {variant}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="icon" variant="default" aria-label="default icon">
                    <LuPhone className="size-5" />
                  </Button>
                  <Button size="icon" variant="outline" aria-label="outline icon">
                    <LuPhone className="size-5" />
                  </Button>
                  <Button size="icon" variant="ghost" aria-label="ghost icon">
                    <LuPhone className="size-5" />
                  </Button>
                  <Button disabled>disabled</Button>
                  <Button disabled>
                    <LuLoader className="size-4 animate-spin" />
                    loading
                  </Button>
                </div>
                <div
                  data-header-surface="dark"
                  className="flex flex-wrap items-center gap-3 rounded-sm bg-foreground px-6 py-8"
                >
                  <Button variant="default" size="lg">
                    default
                  </Button>
                  <Button variant="inverse" size="lg">
                    inverse
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    className="text-background hover:bg-background/10 hover:text-background"
                  >
                    ghost on navy
                  </Button>
                </div>
              </div>
            </Section>
          </LabGate>

          <LabGate id="fields" visibleIds={visibleIds}>
            <Section
              id="fields"
              title="Поля"
              hint="Input, Select, Textarea — h-11 / rounded-sm. Є disabled."
            >
              <div className="grid max-w-xl gap-6">
                <div className="space-y-2">
                  <Label htmlFor="lab-phone">Телефон</Label>
                  <Input id="lab-phone" type="tel" placeholder="+380 XX XXX XX XX" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lab-disabled">Disabled</Label>
                  <Input id="lab-disabled" disabled placeholder="Недоступно" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lab-brand">Марка</Label>
                  <Select defaultValue="man">
                    <SelectTrigger id="lab-brand">
                      <SelectValue placeholder="Оберіть марку" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="man">MAN</SelectItem>
                      <SelectItem value="daf">DAF</SelectItem>
                      <SelectItem value="volvo">Volvo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lab-note">Коментар</Label>
                  <Textarea id="lab-note" placeholder="Під запит: тягач 4x2, Euro 6…" />
                </div>
                <div className="flex gap-3">
                  <Input className="min-w-0 flex-1 font-mono" placeholder="+380…" />
                  <Button className="shrink-0">Надіслати</Button>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="lab-check" defaultChecked />
                  <Label htmlFor="lab-check">Погоджуюсь з обробкою даних</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="lab-check-off" disabled />
                  <Label htmlFor="lab-check-off" className="text-muted-foreground">
                    Disabled checkbox
                  </Label>
                </div>
              </div>
            </Section>
          </LabGate>

          <LabGate id="tabs" visibleIds={visibleIds}>
            <Section
              id="tabs"
              title="Tabs"
              hint="Сегменти в спільній navy-рамці: не окремі outline-кнопки. Активний — заливка primary."
            >
              <Tabs defaultValue="folders" className="max-w-xl">
                <TabsList>
                  <TabsTrigger value="folders">Папки</TabsTrigger>
                  <TabsTrigger value="fields">Поля</TabsTrigger>
                  <TabsTrigger value="preview">Перегляд</TabsTrigger>
                </TabsList>
                <TabsContent value="folders" className="mt-6">
                  <p className="text-sm text-muted-foreground">
                    Структура каталогу — дерево папок у CMS.
                  </p>
                </TabsContent>
                <TabsContent value="fields" className="mt-6">
                  <p className="text-sm text-muted-foreground">
                    Шаблон полів для обраної папки.
                  </p>
                </TabsContent>
                <TabsContent value="preview" className="mt-6">
                  <p className="text-sm text-muted-foreground">
                    Третій тригер — лише для лабу.
                  </p>
                </TabsContent>
              </Tabs>
            </Section>
          </LabGate>

          <LabGate id="table" visibleIds={visibleIds}>
            <Section
              id="table"
              title="Table"
              hint="Лічильник над таблицею, шапка secondary, uppercase tracking, hover pastel — єдиний патерн для адмінки (товари, продажі)."
            >
              <div className="grid max-w-3xl gap-3">
                <p className="text-sm text-muted-foreground">
                  Усього замовлень: 3
                </p>
                <Card className="shadow-sm">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Авто</TableHead>
                          <TableHead>Сума</TableHead>
                          <TableHead>Статус</TableHead>
                          <TableHead>Дата</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>buyer@mtruck.ua</TableCell>
                          <TableCell>Actros 1845</TableCell>
                          <TableCell>$38 500</TableCell>
                          <TableCell>
                            <Badge>Оплачено</Badge>
                          </TableCell>
                          <TableCell>11.09.2026</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>fleet@example.com</TableCell>
                          <TableCell>FH 460</TableCell>
                          <TableCell>$52 000</TableCell>
                          <TableCell>
                            <Badge variant="secondary">Не оплачено</Badge>
                          </TableCell>
                          <TableCell>08.09.2026</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>office@logistics.de</TableCell>
                          <TableCell>R450</TableCell>
                          <TableCell>$41 200</TableCell>
                          <TableCell>
                            <Badge>Оплачено</Badge>
                          </TableCell>
                          <TableCell>01.09.2026</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </Section>
          </LabGate>

          <LabGate id="marks" visibleIds={visibleIds}>
            <Section
              id="marks"
              title="Мітки і знаки"
              hint="Теги, чіпи, обране, breadcrumb, рисочки й стрілки — те, що стоїть на сайті після 01+03."
            >
              <UiLabMarks />
            </Section>
          </LabGate>

          <LabGate id="cascade" visibleIds={visibleIds}>
            <Section
              id="cascade"
              title="Cascade select"
              hint="Клік відкриває список; наведення — колонка справа; у кнопці — повний шлях."
            >
              <UiLabCascade />
            </Section>
          </LabGate>

          <LabGate id="overlays" visibleIds={visibleIds}>
            <Section id="overlays" title="Dropdown / Popover / Tooltip / Sheet">
              <div className="flex flex-wrap items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Меню
                      <LuChevronDown className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuLabel>Акаунт</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Профіль</DropdownMenuItem>
                    <DropdownMenuItem>Замовлення</DropdownMenuItem>
                    <DropdownMenuItem>Вийти</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">Popover</Button>
                  </PopoverTrigger>
                  <PopoverContent align="start">
                    <p className="text-sm text-muted-foreground">
                      Короткий шар з поясненням або фільтром.
                    </p>
                  </PopoverContent>
                </Popover>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" aria-label="Зателефонувати">
                      <LuPhone className="size-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Зателефонувати</TooltipContent>
                </Tooltip>

                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline">Sheet</Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Фільтри</SheetTitle>
                      <SheetDescription>
                        Приклад бічної панелі (мобільне меню / фільтри каталогу).
                      </SheetDescription>
                    </SheetHeader>
                    <div className="grid gap-4 py-6">
                      <div className="space-y-2">
                        <Label htmlFor="sheet-brand">Марка</Label>
                        <Input id="sheet-brand" placeholder="MAN" />
                      </div>
                    </div>
                    <SheetFooter>
                      <Button className="w-full">Застосувати</Button>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </div>
            </Section>
          </LabGate>

          <LabGate id="feedback" visibleIds={visibleIds}>
            <Section id="feedback" title="Accordion">
              <Accordion type="single" collapsible className="max-w-xl border-t border-border">
                <AccordionItem value="sale" className="border-b border-border">
                  <AccordionTrigger>Імпорт і продаж</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Привозимо техніку в Україну і продаємо з майданчика або під запит.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="finance" className="border-b border-border">
                  <AccordionTrigger>Кредит і лізинг</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Фахівці супроводять покупку в кредит або лізинг.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Section>
          </LabGate>

          <LabGate id="states" visibleIds={visibleIds}>
            <Section id="states" title="Avatar / Empty / Skeleton">
              <div className="flex flex-wrap items-center gap-4">
                <Avatar>
                  <AvatarImage src="" alt="" />
                  <AvatarFallback>MT</AvatarFallback>
                </Avatar>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <Empty className="border border-dashed border-border">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <LuInbox className="size-6" />
                    </EmptyMedia>
                    <EmptyTitle>Нічого не знайдено</EmptyTitle>
                    <EmptyDescription>
                      Змініть фільтри або замовте техніку під запит.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button variant="outline" size="sm">
                      Скинути фільтри
                    </Button>
                  </EmptyContent>
                </Empty>

                <div className="space-y-3 rounded-sm border border-border p-6">
                  <Skeleton className="h-40 w-full rounded-sm" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-11 w-32" />
                </div>
              </div>
            </Section>
          </LabGate>

          <LabGate id="card" visibleIds={visibleIds}>
            <Section
              id="card"
              title="Card (оболонка)"
              hint="Сирий shadcn Card. Картка техніки — нижче, окремим блоком."
            >
              <Card className="max-w-sm shadow-none">
                <CardHeader>
                  <CardTitle>Картка</CardTitle>
                  <CardDescription>
                    Приклад оболонки. Тінь і радіус — окреме рішення від кнопок.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    MAN TGX 18.440 · 2018 · Euro 6
                  </p>
                </CardContent>
                <CardFooter className="gap-3">
                  <Button>Детальніше</Button>
                  <Button variant="outline">Каталог</Button>
                </CardFooter>
              </Card>
            </Section>
          </LabGate>
          </div>
        </div>
      </div>
      {visibleIds.has("vehicle") ? children : null}
    </TooltipProvider>
  );
}
