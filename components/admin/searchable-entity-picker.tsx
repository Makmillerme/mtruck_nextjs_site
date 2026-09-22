"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { sheetFieldTriggerClassName } from "@/lib/ui/sheet-field";
import { cn } from "@/lib/utils";
import { LuCheck, LuChevronsUpDown, LuSearch } from "react-icons/lu";

export type SearchableEntityOption = {
  value: string;
  label: string;
  keywords: string[];
};

/** Show search only when the list is long enough to need it. */
export const SHEET_COMBOBOX_SEARCH_MIN = 10;

function optionHaystack(option: SearchableEntityOption) {
  return [option.label, option.value, ...option.keywords]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase();
}

export default function SearchableEntityPicker({
  name,
  label,
  placeholder,
  searchPlaceholder,
  emptyLabel,
  options,
  value,
  onValueChange,
  required = false,
  allowClear = true,
  clearLabel,
  disabled = false,
  hideLabel = false,
  searchable = true,
}: {
  name: string;
  label: string;
  placeholder: string;
  searchPlaceholder: string;
  emptyLabel: string;
  options: SearchableEntityOption[];
  value: string;
  onValueChange: (value: string) => void;
  required?: boolean;
  allowClear?: boolean;
  clearLabel?: string;
  disabled?: boolean;
  /** Keep a11y label, hide visible Label (e.g. currency beside price). */
  hideLabel?: boolean;
  /** Show search field + filter. Off for short fixed lists. */
  searchable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value]
  );

  const filtered = useMemo(() => {
    if (!searchable) return options;
    const q = query.trim().toLocaleLowerCase();
    if (!q) return options;
    return options.filter((option) => optionHaystack(option).includes(q));
  }, [options, query, searchable]);

  return (
    <div className="grid gap-2">
      {hideLabel ? (
        <span className="sr-only">{label}</span>
      ) : (
        <label htmlFor={name} className="text-sm font-medium">
          {label}
        </label>
      )}
      <input
        type="hidden"
        id={name}
        name={name}
        value={value}
        required={required}
      />
      {/*
        modal={false}: nested inside Sheet (Dialog). modal Popover traps/overlays
        and leaves the search field gray + unclickable.
      */}
      <Popover
        modal={false}
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setQuery("");
        }}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={sheetFieldTriggerClassName}
          >
            <span className="truncate text-left">
              {selected?.label ?? placeholder}
            </span>
            <LuChevronsUpDown className="size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="z-[200] w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
          onOpenAutoFocus={(event) => {
            // Let the plain search Input take focus when present.
            if (!searchable) event.preventDefault();
          }}
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          <Command shouldFilter={false} className="rounded-sm border-0">
            {searchable ? (
              <div className="flex items-center gap-2 border-b px-3">
                <LuSearch
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    // Keep typing out of Sheet focus trap / dismiss handlers.
                    event.stopPropagation();
                  }}
                  placeholder={searchPlaceholder}
                  className="h-10 border-0 bg-transparent px-0 text-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-0"
                  aria-label={searchPlaceholder}
                />
              </div>
            ) : null}
            <CommandList>
              <CommandEmpty>{emptyLabel}</CommandEmpty>
              <CommandGroup>
                {allowClear ? (
                  <CommandItem
                    value="__clear__"
                    onSelect={() => {
                      onValueChange("");
                      setOpen(false);
                      setQuery("");
                    }}
                  >
                    <LuCheck
                      className={cn(
                        "mr-2 size-4",
                        value ? "opacity-0" : "opacity-100"
                      )}
                    />
                    {clearLabel ?? placeholder}
                  </CommandItem>
                ) : null}
                {filtered.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    keywords={[option.label, ...option.keywords]}
                    onSelect={() => {
                      onValueChange(option.value);
                      setOpen(false);
                      setQuery("");
                    }}
                  >
                    <LuCheck
                      className={cn(
                        "mr-2 size-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="truncate">{option.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
