"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const TRACK_CSS_PX = 6;

/** CSS height nearest TRACK_CSS_PX that covers a whole number of device pixels. */
function quantizedHeightCss(dpr: number) {
  const devicePx = Math.max(1, Math.round(TRACK_CSS_PX * dpr));
  return devicePx / dpr;
}

/** Shift so the top edge lands on a device-pixel boundary (height already quantized). */
function snapOffset(topCss: number, dpr: number) {
  const topDevice = topCss * dpr;
  const delta = Math.round(topDevice) - topDevice;
  return delta / dpr;
}

function useCrispTrack(trackRef: React.RefObject<HTMLSpanElement | null>) {
  React.useLayoutEffect(() => {
    const track = trackRef.current;
    const root = track?.parentElement;
    if (!track || !root) return;

    let frame = 0;
    const snap = () => {
      frame = 0;
      const dpr = window.devicePixelRatio || 1;
      const heightCss = quantizedHeightCss(dpr);
      track.style.height = `${heightCss}px`;
      track.style.transform = "";
      root.style.setProperty("--slider-snap", "0px");
      const rect = track.getBoundingClientRect();
      const dy = snapOffset(rect.top, dpr);
      const snapValue = Math.abs(dy) < 0.01 / dpr ? "0px" : `${dy}px`;
      root.style.setProperty("--slider-snap", snapValue);
      track.style.transform = snapValue === "0px" ? "" : `translateY(${snapValue})`;
    };
    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(snap);
    };

    snap();
    const observer = new ResizeObserver(schedule);
    observer.observe(root);
    window.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);
    const viewport = window.visualViewport;
    viewport?.addEventListener("resize", schedule);
    viewport?.addEventListener("scroll", schedule);

    let media = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    const onDpr = () => {
      media.removeEventListener("change", onDpr);
      media = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
      media.addEventListener("change", onDpr);
      schedule();
    };
    media.addEventListener("change", onDpr);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
      viewport?.removeEventListener("resize", schedule);
      viewport?.removeEventListener("scroll", schedule);
      media.removeEventListener("change", onDpr);
      root.style.removeProperty("--slider-snap");
      track.style.height = "";
      track.style.transform = "";
    };
  }, [trackRef]);
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, value, defaultValue, ...props }, ref) => {
  const thumbCount = value?.length ?? defaultValue?.length ?? 1;
  const trackRef = React.useRef<HTMLSpanElement>(null);
  useCrispTrack(trackRef);
  return (
    <SliderPrimitive.Root
      ref={ref}
      value={value}
      defaultValue={defaultValue}
      className={cn(
        // py-3/-my-3 keeps the 6px line, but the pointer box is 40px tall so nearby clicks still land.
        "relative flex w-full touch-none select-none items-center py-3 -my-3",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        ref={trackRef}
        className="relative h-[6px] w-full grow overflow-hidden rounded-full bg-primary/20"
      >
        <SliderPrimitive.Range className="absolute h-full bg-primary" />
      </SliderPrimitive.Track>
      {Array.from({ length: thumbCount }, (_, index) => (
        <SliderPrimitive.Thumb
          key={index}
          className="relative block h-4 w-4 translate-y-[var(--slider-snap)] rounded-full border border-primary/50 bg-card shadow transition-colors before:absolute before:left-1/2 before:top-1/2 before:h-10 before:w-10 before:-translate-x-1/2 before:-translate-y-1/2 before:content-[''] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  );
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
