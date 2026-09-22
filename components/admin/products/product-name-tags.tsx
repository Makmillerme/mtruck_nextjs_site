"use client";

import { useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type ProductNameTagItem = {
  id: string;
  label: string;
  /** @deprecated Visual is always UI Lab `Badge variant="tag"`. Kept for call-site compat. */
  filled?: boolean;
};

const nameFieldClassName =
  "flex h-11 min-w-0 flex-1 flex-wrap items-center gap-1.5 rounded-sm border border-input bg-background px-3 text-sm focus-within:outline-none focus-within:ring-1 focus-within:ring-ring";

function nameSeparator(separator?: string) {
  return separator && separator.trim().length > 0 ? separator : "\u00b7";
}

/** UI Lab canon: Badge `tag` for every name-template chip (sheet + settings preview). */
export function ProductNameTagChips({
  items,
  separator,
}: {
  items: ProductNameTagItem[];
  separator?: string;
}) {
  const gap = nameSeparator(separator);
  return (
    <>
      {items.map((item, index) => (
        <span key={item.id} className="inline-flex items-center gap-1.5">
          {index > 0 ? (
            <span className="text-xs text-muted-foreground">{gap}</span>
          ) : null}
          <Badge variant="tag">{item.label}</Badge>
        </span>
      ))}
    </>
  );
}

function NameText({
  initial,
  onChange,
  className,
}: {
  initial: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.textContent = initial;
    // Seed once; later keystrokes stay in the DOM so the caret does not jump.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <span
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      className={cn("min-w-[1ch] outline-none", className)}
      onInput={() => onChange(ref.current?.textContent ?? "")}
    />
  );
}

/** One name field: free text, then template tags, then free text. */
export function ProductNameInput({
  tags,
  separator,
  prefix,
  suffix,
  onPrefixChange,
  onSuffixChange,
  resetKey,
}: {
  tags: ProductNameTagItem[];
  separator?: string;
  prefix: string;
  suffix: string;
  onPrefixChange: (value: string) => void;
  onSuffixChange: (value: string) => void;
  resetKey: string;
}) {
  const hasTags = tags.length > 0;

  return (
    <div className={nameFieldClassName}>
      <NameText
        key={`${resetKey}-pre`}
        initial={prefix}
        onChange={onPrefixChange}
      />
      {hasTags && prefix.trim().length > 0 ? (
        <span aria-hidden className="select-none text-transparent">
          {" "}
        </span>
      ) : null}
      <ProductNameTagChips items={tags} separator={separator} />
      {hasTags ? (
        <span aria-hidden className="select-none text-transparent">
          {" "}
        </span>
      ) : null}
      <NameText
        key={`${resetKey}-suf`}
        initial={suffix}
        onChange={onSuffixChange}
        className="flex-1"
      />
    </div>
  );
}

export default function ProductNameTags({
  items,
  separator,
  emptyLabel,
  inline = false,
  className,
}: {
  items: ProductNameTagItem[];
  separator?: string;
  emptyLabel?: string;
  inline?: boolean;
  className?: string;
}) {
  if (items.length === 0) {
    if (inline) return null;
    return emptyLabel ? (
      <p
        className={cn(
          "rounded-sm border bg-muted/40 px-3 py-2 text-sm text-muted-foreground",
          className
        )}
      >
        {emptyLabel}
      </p>
    ) : null;
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1.5",
        !inline && "rounded-sm border bg-muted/40 px-3 py-2",
        className
      )}
    >
      <ProductNameTagChips items={items} separator={separator} />
    </div>
  );
}
