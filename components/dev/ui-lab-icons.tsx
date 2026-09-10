"use client";

import { cn } from "@/lib/utils";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CaretSortIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  Cross2Icon,
  DotFilledIcon,
  DotsHorizontalIcon,
  ReloadIcon,
} from "@radix-ui/react-icons";
import {
  ArrowUpRight,
  Award,
  Banknote,
  Boxes,
  Calendar,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock,
  Coins,
  Container,
  FileCheck,
  Globe,
  Handshake,
  Leaf,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Route,
  Search,
  Settings2,
  Shield,
  ShieldCheck,
  Truck,
  TruckIcon,
  Users,
  Van,
  Wrench,
} from "lucide-react";
import type { ComponentType } from "react";
import { FaHeart, FaRegHeart, FaRegStar, FaStar, FaTelegram } from "react-icons/fa";
import {
  LuArrowUpDown,
  LuCheck,
  LuChevronDown,
  LuClock,
  LuHeart,
  LuInbox,
  LuLayoutDashboard,
  LuLayoutGrid,
  LuList,
  LuListFilter,
  LuLoader,
  LuLogOut,
  LuMail,
  LuMapPin,
  LuMenu,
  LuPackage,
  LuPanelLeft,
  LuPen,
  LuPhone,
  LuSearch,
  LuSettings,
  LuShare2,
  LuShoppingCart,
  LuTag,
  LuTrash2,
  LuUser,
  LuX,
} from "react-icons/lu";

type LabIcon = {
  name: string;
  Icon: ComponentType<{ className?: string }>;
};

const LUCIDE: readonly LabIcon[] = [
  { name: "ArrowUpRight", Icon: ArrowUpRight },
  { name: "Award", Icon: Award },
  { name: "Banknote", Icon: Banknote },
  { name: "Boxes", Icon: Boxes },
  { name: "Calendar", Icon: Calendar },
  { name: "ChevronDown", Icon: ChevronDown },
  { name: "ChevronRight", Icon: ChevronRight },
  { name: "ClipboardList", Icon: ClipboardList },
  { name: "Clock", Icon: Clock },
  { name: "Coins", Icon: Coins },
  { name: "Container", Icon: Container },
  { name: "FileCheck", Icon: FileCheck },
  { name: "Globe", Icon: Globe },
  { name: "Handshake", Icon: Handshake },
  { name: "Leaf", Icon: Leaf },
  { name: "Loader2", Icon: Loader2 },
  { name: "Mail", Icon: Mail },
  { name: "MapPin", Icon: MapPin },
  { name: "Phone", Icon: Phone },
  { name: "Route", Icon: Route },
  { name: "Search", Icon: Search },
  { name: "Settings2", Icon: Settings2 },
  { name: "Shield", Icon: Shield },
  { name: "ShieldCheck", Icon: ShieldCheck },
  { name: "Truck", Icon: Truck },
  { name: "TruckIcon", Icon: TruckIcon },
  { name: "Users", Icon: Users },
  { name: "Van", Icon: Van },
  { name: "Wrench", Icon: Wrench },
];

const LUCIDE_REACT: readonly LabIcon[] = [
  { name: "LuArrowUpDown", Icon: LuArrowUpDown },
  { name: "LuCheck", Icon: LuCheck },
  { name: "LuChevronDown", Icon: LuChevronDown },
  { name: "LuClock", Icon: LuClock },
  { name: "LuHeart", Icon: LuHeart },
  { name: "LuInbox", Icon: LuInbox },
  { name: "LuLayoutDashboard", Icon: LuLayoutDashboard },
  { name: "LuLayoutGrid", Icon: LuLayoutGrid },
  { name: "LuList", Icon: LuList },
  { name: "LuListFilter", Icon: LuListFilter },
  { name: "LuLoader", Icon: LuLoader },
  { name: "LuLogOut", Icon: LuLogOut },
  { name: "LuMail", Icon: LuMail },
  { name: "LuMapPin", Icon: LuMapPin },
  { name: "LuMenu", Icon: LuMenu },
  { name: "LuPackage", Icon: LuPackage },
  { name: "LuPanelLeft", Icon: LuPanelLeft },
  { name: "LuPen", Icon: LuPen },
  { name: "LuPhone", Icon: LuPhone },
  { name: "LuSearch", Icon: LuSearch },
  { name: "LuSettings", Icon: LuSettings },
  { name: "LuShare2", Icon: LuShare2 },
  { name: "LuShoppingCart", Icon: LuShoppingCart },
  { name: "LuTag", Icon: LuTag },
  { name: "LuTrash2", Icon: LuTrash2 },
  { name: "LuUser", Icon: LuUser },
  { name: "LuX", Icon: LuX },
];

const FA: readonly LabIcon[] = [
  { name: "FaHeart", Icon: FaHeart },
  { name: "FaRegHeart", Icon: FaRegHeart },
  { name: "FaStar", Icon: FaStar },
  { name: "FaRegStar", Icon: FaRegStar },
  { name: "FaTelegram", Icon: FaTelegram },
];

const RADIX: readonly LabIcon[] = [
  { name: "ArrowLeftIcon", Icon: ArrowLeftIcon },
  { name: "ArrowRightIcon", Icon: ArrowRightIcon },
  { name: "CaretSortIcon", Icon: CaretSortIcon },
  { name: "CheckIcon", Icon: CheckIcon },
  { name: "ChevronDownIcon", Icon: ChevronDownIcon },
  { name: "ChevronRightIcon", Icon: ChevronRightIcon },
  { name: "ChevronUpIcon", Icon: ChevronUpIcon },
  { name: "Cross2Icon", Icon: Cross2Icon },
  { name: "DotFilledIcon", Icon: DotFilledIcon },
  { name: "DotsHorizontalIcon", Icon: DotsHorizontalIcon },
  { name: "ReloadIcon", Icon: ReloadIcon },
];

const PACKS = [
  { key: "lucide", label: "lucide-react — маркетинг, картки, форми", items: LUCIDE },
  { key: "lu", label: "react-icons/lu — хедер, кабінет, каталог", items: LUCIDE_REACT },
  { key: "fa", label: "react-icons/fa — обране, рейтинг, Telegram", items: FA },
  { key: "radix", label: "@radix-ui/react-icons — shadcn-примітиви", items: RADIX },
] as const;

const SURFACES = [
  {
    key: "white",
    label: "white",
    shell: "bg-background text-foreground border border-border",
    caption: "text-muted-foreground",
    stroke: "text-foreground",
    muted: "text-muted-foreground",
    primary: "text-primary",
    disk: "bg-primary/10 text-primary",
    diskSolid: "bg-primary text-primary-foreground",
    square: "bg-foreground/5 text-foreground",
  },
  {
    key: "pastel",
    label: "pastel",
    shell: "bg-secondary text-foreground",
    caption: "text-muted-foreground",
    stroke: "text-foreground",
    muted: "text-muted-foreground",
    primary: "text-primary",
    disk: "bg-primary/10 text-primary",
    diskSolid: "bg-primary text-primary-foreground",
    square: "bg-background text-foreground",
  },
  {
    key: "navy",
    label: "navy",
    shell: "bg-foreground text-background",
    caption: "text-background/55",
    stroke: "text-background",
    muted: "text-background/55",
    primary: "text-primary",
    disk: "bg-background/10 text-background",
    diskSolid: "bg-background text-foreground",
    square: "bg-background/10 text-background",
  },
] as const;

function IconTile({
  name,
  Icon,
  surface,
}: {
  name: string;
  Icon: LabIcon["Icon"];
  surface: (typeof SURFACES)[number];
}) {
  return (
    <div className="flex flex-col gap-2 rounded-sm p-2">
      <span className={cn("font-mono text-[10px] leading-tight", surface.caption)} title={name}>
        {name}
      </span>
      <div className="flex flex-wrap items-center gap-1.5">
        <Icon className={cn("size-5 shrink-0", surface.stroke)} />
        <Icon className={cn("size-5 shrink-0", surface.primary)} />
        <Icon className={cn("size-5 shrink-0", surface.muted)} />
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className={cn("flex size-8 items-center justify-center rounded-full", surface.disk)}>
          <Icon className="size-3.5" />
        </span>
        <span className={cn("flex size-8 items-center justify-center rounded-full", surface.diskSolid)}>
          <Icon className="size-3.5" />
        </span>
        <span className={cn("flex size-8 items-center justify-center rounded-sm", surface.square)}>
          <Icon className="size-3.5" />
        </span>
      </div>
    </div>
  );
}

function StyleKey({ captionClass }: { captionClass: string }) {
  return (
    <p className={cn("font-mono text-[10px] leading-relaxed", captionClass)}>
      ряд 1: stroke · primary · muted
      <br />
      ряд 2: disk wash · disk solid · square
    </p>
  );
}

export default function UiLabIcons() {
  return (
    <div className="space-y-10">
      {SURFACES.map((surface) => (
        <div
          key={surface.key}
          data-header-surface={surface.key === "navy" ? "dark" : undefined}
          className={cn("space-y-8 rounded-sm px-4 py-6 sm:px-6", surface.shell)}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <p className={cn("font-mono text-xs uppercase tracking-[0.22em]", surface.caption)}>
              {surface.label}
            </p>
            <StyleKey captionClass={surface.caption} />
          </div>

          {PACKS.map((pack) => (
            <div key={`${surface.key}-${pack.key}`} className="space-y-3">
              <p className={cn("text-sm font-semibold", surface.stroke)}>{pack.label}</p>
              <div className="grid grid-cols-2 gap-x-2 gap-y-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {pack.items.map(({ name, Icon }) => (
                  <IconTile
                    key={`${surface.key}-${pack.key}-${name}`}
                    name={name}
                    Icon={Icon}
                    surface={surface}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
