"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type DragEvent,
} from "react";
import { useTranslations } from "next-intl";
import { ConfirmDeleteCallbackIcon } from "@/components/form/ConfirmDelete";
import PhotoCarousel from "@/components/media/photo-carousel";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { PRODUCT_IMAGE_MAX } from "@/lib/catalog/product-image-limits";
import { LuPlus } from "react-icons/lu";

export type ProductGalleryExisting = {
  id: string;
  url: string;
};

type GalleryItem =
  | { key: string; kind: "existing"; id: string; url: string }
  | { key: string; kind: "new"; file: File; url: string };

function toExistingItems(images: ProductGalleryExisting[]): GalleryItem[] {
  return images.map((image) => ({
    key: `e:${image.id}`,
    kind: "existing" as const,
    id: image.id,
    url: image.url,
  }));
}

function syncFilesInput(input: HTMLInputElement | null, files: File[]) {
  if (!input) return;
  const dt = new DataTransfer();
  for (const file of files) dt.items.add(file);
  input.files = dt.files;
}

function moveItem(list: GalleryItem[], fromKey: string, toKey: string) {
  if (fromKey === toKey) return list;
  const from = list.findIndex((item) => item.key === fromKey);
  const to = list.findIndex((item) => item.key === toKey);
  if (from < 0 || to < 0) return list;
  const next = [...list];
  const [moved] = next.splice(from, 1);
  if (!moved) return list;
  next.splice(to, 0, moved);
  return next;
}

export default function ProductImageGalleryField({
  existing = [],
  resetKey = "new",
  max = PRODUCT_IMAGE_MAX,
  name = "images",
  orderFieldName = "imageOrder",
  alt = "",
}: {
  existing?: ProductGalleryExisting[];
  /** Remount / reseed when product sheet switches. */
  resetKey?: string;
  max?: number;
  name?: string;
  orderFieldName?: string;
  alt?: string;
}) {
  const t = useTranslations("Admin");
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const dragKeyRef = useRef<string | null>(null);
  const [items, setItems] = useState<GalleryItem[]>(() =>
    toExistingItems(existing)
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [draggingKey, setDraggingKey] = useState<string | null>(null);

  useEffect(() => {
    setItems(toExistingItems(existing));
    setActiveIndex(0);
  }, [resetKey]);

  useEffect(() => {
    return () => {
      for (const item of items) {
        if (item.kind === "new") URL.revokeObjectURL(item.url);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- revoke blob URLs on unmount
  }, []);

  const newFiles = useMemo(
    () =>
      items
        .filter(
          (item): item is Extract<GalleryItem, { kind: "new" }> =>
            item.kind === "new"
        )
        .map((item) => item.file),
    [items]
  );

  useEffect(() => {
    syncFilesInput(fileRef.current, newFiles);
  }, [newFiles]);

  const orderPayload = useMemo(
    () =>
      JSON.stringify(
        items.map((item) => {
          if (item.kind === "new") return { t: "n" };
          if (item.id.startsWith("cover:")) return { t: "c" };
          return { t: "e", id: item.id };
        })
      ),
    [items]
  );

  const slides = useMemo(
    () => items.map((item) => ({ src: item.url, alt })),
    [items, alt]
  );

  const canAdd = items.length < max;

  const addFiles = useCallback(
    (list: FileList | null) => {
      if (!list || list.length === 0) return;
      const room = max - items.length;
      if (room <= 0) return;
      const next: GalleryItem[] = [];
      for (const file of Array.from(list).slice(0, room)) {
        if (!file.type.startsWith("image/")) continue;
        next.push({
          key: `n:${file.name}:${file.size}:${file.lastModified}:${Math.random().toString(36).slice(2, 8)}`,
          kind: "new",
          file,
          url: URL.createObjectURL(file),
        });
      }
      if (next.length === 0) return;
      setItems((prev) => {
        const merged = [...prev, ...next];
        setActiveIndex(merged.length - 1);
        return merged;
      });
    },
    [items.length, max]
  );

  const onDragStart = useCallback((event: DragEvent, key: string) => {
    dragKeyRef.current = key;
    setDraggingKey(key);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", key);
  }, []);

  const onDragOver = useCallback((event: DragEvent, overKey: string) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    const fromKey = dragKeyRef.current;
    if (!fromKey || fromKey === overKey) return;
    setItems((prev) => moveItem(prev, fromKey, overKey));
  }, []);

  const onDragEnd = useCallback(() => {
    const key = dragKeyRef.current;
    dragKeyRef.current = null;
    setDraggingKey(null);
    if (!key) return;
    setItems((prev) => {
      const index = prev.findIndex((item) => item.key === key);
      if (index >= 0) setActiveIndex(index);
      return prev;
    });
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((prev) => {
      const removed = prev.find((item) => item.key === key);
      if (removed?.kind === "new") URL.revokeObjectURL(removed.url);
      const next = prev.filter((item) => item.key !== key);
      setActiveIndex((index) =>
        next.length === 0 ? 0 : Math.min(index, next.length - 1)
      );
      return next;
    });
  }, []);

  const thumbFrameClassName =
    "relative aspect-[4/3] w-full rounded-sm border bg-muted";
  const thumbMediaClassName =
    "absolute inset-0 overflow-hidden rounded-sm";

  return (
    <div className="grid w-full gap-2">
      <Label htmlFor={inputId}>{t("images", { max })}</Label>

      <div className="grid w-full gap-3">
        {slides.length > 0 ? (
          <PhotoCarousel
            images={slides}
            variant="card"
            sizes="(max-width: 640px) 100vw, 28rem"
            className="w-full"
            startIndex={activeIndex}
            priority
          />
        ) : (
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm border bg-muted" />
        )}

        <ul className="grid w-full list-none grid-cols-4 gap-2 p-0 sm:grid-cols-5">
          {items.map((item, index) => (
            <li
              key={item.key}
              draggable
              onDragStart={(event) => onDragStart(event, item.key)}
              onDragOver={(event) => onDragOver(event, item.key)}
              onDragEnd={onDragEnd}
              onDrop={(event) => event.preventDefault()}
              onClick={() => setActiveIndex(index)}
              className={cn(
                thumbFrameClassName,
                "cursor-grab active:cursor-grabbing",
                index === activeIndex
                  ? "border-foreground ring-1 ring-foreground"
                  : "border-border opacity-80",
                draggingKey === item.key && "opacity-40"
              )}
            >
              <div className={thumbMediaClassName}>
                <Image
                  src={item.url}
                  alt=""
                  fill
                  sizes="120px"
                  draggable={false}
                  className="pointer-events-none object-cover"
                  unoptimized={item.kind === "new"}
                />
              </div>
              <ConfirmDeleteCallbackIcon
                onConfirm={() => removeItem(item.key)}
                className="absolute -right-1.5 -top-1.5 z-10 size-6 shrink-0 rounded-full border border-destructive/40 bg-background text-destructive shadow-sm hover:bg-destructive hover:text-destructive-foreground"
                iconClassName="size-3"
              />
            </li>
          ))}

          {canAdd ? (
            <li className="list-none">
              <button
                type="button"
                id={inputId}
                aria-label={t("imagesAdd")}
                className={cn(
                  thumbFrameClassName,
                  "flex items-center justify-center border-dashed border-input bg-background text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                )}
                onClick={() => fileRef.current?.click()}
              >
                <LuPlus className="size-5" />
              </button>
            </li>
          ) : null}
        </ul>
      </div>

      <input
        ref={fileRef}
        type="file"
        name={name}
        accept="image/*"
        multiple
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          addFiles(event.target.files);
          event.target.value = "";
        }}
      />
      <input type="hidden" name={orderFieldName} value={orderPayload} />

      <p className="text-xs text-muted-foreground">
        {t("imagesHint", { count: items.length, max })}
      </p>
    </div>
  );
}
