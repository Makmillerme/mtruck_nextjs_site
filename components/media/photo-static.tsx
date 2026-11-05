import Image from "next/image";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/** Single-image card/PDP frame without Embla (keeps ProductCard chunk lighter). */
export default function PhotoStatic({
  src,
  alt = "",
  href,
  sizes = "(max-width: 640px) 100vw, (max-width: 899px) 50vw, 33vw",
  priority = false,
  className,
  overlay,
  frame = "ratio",
  zoomOnHover = true,
  onImageClick,
}: {
  src: string;
  alt?: string;
  href?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  overlay?: ReactNode;
  frame?: "ratio" | "fill";
  zoomOnHover?: boolean;
  onImageClick?: () => void;
}) {
  const stageClass =
    frame === "fill"
      ? "relative h-full min-h-0 w-full min-w-0 overflow-hidden bg-muted"
      : "relative aspect-[4/3] w-full min-w-0 overflow-hidden bg-muted";

  const image = (
    <span className="absolute inset-0 block overflow-hidden">
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        sizes={sizes}
        draggable={false}
        className={cn(
          "pointer-events-none select-none object-cover origin-center will-change-transform",
          zoomOnHover &&
            "transition-transform duration-500 group-hover:scale-105"
        )}
      />
    </span>
  );

  return (
    <div
      className={cn(
        stageClass,
        className,
        onImageClick && !href && "cursor-zoom-in"
      )}
      onClick={onImageClick && !href ? onImageClick : undefined}
      onKeyDown={
        onImageClick && !href
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onImageClick();
              }
            }
          : undefined
      }
      role={onImageClick && !href ? "button" : undefined}
      tabIndex={onImageClick && !href ? 0 : undefined}
    >
      {href ? (
        <Link href={href} className="absolute inset-0 block overflow-hidden">
          {image}
        </Link>
      ) : (
        <div className="absolute inset-0 overflow-hidden">{image}</div>
      )}
      {overlay ? (
        <div className="pointer-events-none absolute inset-0 z-10">{overlay}</div>
      ) : null}
    </div>
  );
}
