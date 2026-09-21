"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEdgeMenuAlign } from "@/lib/use-edge-menu-align";
import { useRef, useState } from "react";
import { LuCheck, LuChevronDown } from "react-icons/lu";

/** Lab canon: toolbar / field / header-exception dropdowns + thin scrollbar. */
export function UiLabDropdownCanon() {
  const toolbarRef = useRef<HTMLButtonElement>(null);
  const fieldRef = useRef<HTMLButtonElement>(null);
  const toolbarAlign = useEdgeMenuAlign("end");
  const fieldAlign = useEdgeMenuAlign("start");
  const [sort, setSort] = useState("newest");
  const [make, setMake] = useState<string | null>(null);

  return (
    <div className="grid gap-8">
      <div className="grid gap-3">
        <p className="text-sm text-muted-foreground">
          Канон (крім хедера):{" "}
          <code className="text-xs">Button outline</code> +{" "}
          <code className="text-xs">DropdownMenu</code>, панель{" "}
          <code className="text-xs">w-max</code>, align по краю в’юпорта.
        </p>
        <div className="flex flex-wrap items-end gap-4">
          <div className="grid gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Toolbar (сортування / page size)
            </span>
            <DropdownMenu
              modal={false}
              onOpenChange={(open) =>
                toolbarAlign.onOpenChange(open, toolbarRef.current)
              }
            >
              <DropdownMenuTrigger asChild>
                <Button
                  ref={toolbarRef}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 gap-2"
                >
                  Сортування
                  <LuChevronDown className="size-4 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align={toolbarAlign.align}
                collisionPadding={toolbarAlign.collisionPadding}
                className="min-w-0 w-max"
              >
                <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
                  <DropdownMenuRadioItem value="newest">
                    Новіші
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="price-asc">
                    Ціна ↑
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="price-desc">
                    Ціна ↓
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="grid w-56 gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Поле фільтра (обране = текст, без заливки)
            </span>
            <DropdownMenu
              modal={false}
              onOpenChange={(open) =>
                fieldAlign.onOpenChange(open, fieldRef.current)
              }
            >
              <DropdownMenuTrigger asChild>
                <Button
                  ref={fieldRef}
                  type="button"
                  variant="outline"
                  size="sm"
                  className={
                    make
                      ? "h-9 w-full justify-between border-primary font-normal"
                      : "h-9 w-full justify-between font-normal"
                  }
                >
                  <span className="truncate">{make ?? "Марка"}</span>
                  <LuChevronDown className="size-4 shrink-0 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align={fieldAlign.align}
                collisionPadding={fieldAlign.collisionPadding}
                className="min-w-0 w-[var(--radix-dropdown-menu-trigger-width)]"
              >
                {["DAF", "Volvo", "Scania"].map((item) => (
                  <DropdownMenuItem
                    key={item}
                    className="justify-between"
                    onSelect={() => setMake(item)}
                  >
                    {item}
                    {make === item ? (
                      <LuCheck className="size-3.5 text-primary" />
                    ) : null}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="grid gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Хедер (не чіпати)
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-9 gap-1 px-2"
                >
                  UA
                  <LuChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-28">
                <DropdownMenuItem>UA</DropdownMenuItem>
                <DropdownMenuItem>EN</DropdownMenuItem>
                <DropdownMenuItem>DE</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="grid gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          Скролбар <code className="text-xs">.app-scroll</code>
        </span>
        <div className="app-scroll h-36 max-w-xs rounded-sm border border-border p-3 text-sm text-muted-foreground">
          {Array.from({ length: 16 }, (_, i) => (
            <p key={i} className="py-0.5">
              Рядок {i + 1} — тонкий трек і округлий thumb на весь сайт.
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
