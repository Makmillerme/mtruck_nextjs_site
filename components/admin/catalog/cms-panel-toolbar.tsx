import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LuPlus, LuSearch } from "react-icons/lu";

export default function CmsPanelToolbar({
  search,
  onSearchChange,
  searchPlaceholder,
  createLabel,
  onCreate,
  infoTip,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  createLabel: string;
  onCreate: () => void;
  infoTip: ReactNode;
}) {
  return (
    <div className="flex w-full min-w-0 items-center gap-2">
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
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 gap-2"
          onClick={onCreate}
        >
          <LuPlus className="size-4" />
          {createLabel}
        </Button>
        {infoTip}
      </div>
    </div>
  );
}
