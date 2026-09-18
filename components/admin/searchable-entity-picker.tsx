"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { LuCheck, LuChevronsUpDown } from "react-icons/lu";

export type SearchableEntityOption = {
  value: string;
  label: string;
  keywords: string[];
};

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
}) {
  const [open, setOpen] = useState(false);

  const selected = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value]
  );

  return (
    <div className="grid gap-2">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <input
        type="hidden"
        id={name}
        name={name}
        value={value}
        required={required}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="h-11 w-full justify-between font-normal"
          >
            <span className="truncate text-left">
              {selected?.label ?? placeholder}
            </span>
            <LuChevronsUpDown className="size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
        >
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyLabel}</CommandEmpty>
              <CommandGroup>
                {allowClear ? (
                  <CommandItem
                    value={`__clear__ ${clearLabel ?? placeholder}`}
                    onSelect={() => {
                      onValueChange("");
                      setOpen(false);
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
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={`${option.label} ${option.keywords.join(" ")}`}
                    onSelect={() => {
                      onValueChange(option.value);
                      setOpen(false);
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
