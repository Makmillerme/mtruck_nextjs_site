"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ReactNode } from "react";
import { LuListFilter, LuPlus, LuSearch } from "react-icons/lu";

export default function AdminListToolbar({
  search,
  onSearchChange,
  searchPlaceholder,
  filterSheet,
  createLabel,
  onCreate,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  filterSheet: ReactNode;
  createLabel: string;
  onCreate: () => void;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <div className="relative min-w-0 flex-1">
        <LuSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={search}
          placeholder={searchPlaceholder}
          className="h-9 min-w-0 pl-9"
          onChange={(event) => onSearchChange(event.target.value)}
          aria-label={searchPlaceholder}
        />
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {filterSheet}
        <Button
          type="button"
          size="sm"
          className="h-9 gap-2 whitespace-nowrap"
          onClick={onCreate}
        >
          <LuPlus className="size-4 shrink-0" />
          <span className="hidden sm:inline">{createLabel}</span>
        </Button>
      </div>
    </div>
  );
}

export function AdminFilterTrigger({
  label,
  count,
}: {
  label: string;
  count: number;
}) {
  return (
    <Button
      type="button"
      variant="default"
      size="sm"
      className="relative h-9 gap-2 whitespace-nowrap"
      aria-label={label}
    >
      <LuListFilter className="size-4 shrink-0" />
      <span className="hidden sm:inline">{label}</span>
      {count > 0 ? (
        <Badge className="h-5 min-w-5 border-0 bg-primary-foreground px-1.5 text-primary hover:bg-primary-foreground">
          {count}
        </Badge>
      ) : null}
    </Button>
  );
}
