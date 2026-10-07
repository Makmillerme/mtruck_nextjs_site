"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { useFloatingScrollRef } from "@/lib/ui/floating-scroll"
import { cn } from "@/lib/utils"

function Popover({
  modal = true,
  ...props
}: React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root modal={modal} {...props} />
}

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverAnchor = PopoverPrimitive.Anchor

type PopoverSide = NonNullable<
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>["side"]
>

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(
  (
    {
      className,
      align = "center",
      sideOffset = 4,
      side,
      avoidCollisions,
      ...props
    },
    ref
  ) => {
    const scrollRef = useFloatingScrollRef(ref)
    const [frozenSide, setFrozenSide] = React.useState<PopoverSide | null>(
      null
    )
    const nodeRef = React.useRef<HTMLDivElement | null>(null)
    const originRef = React.useRef<{ top: number; left: number } | null>(null)

    const setRefs = React.useCallback(
      (node: HTMLDivElement | null) => {
        nodeRef.current = node
        return scrollRef(node)
      },
      [scrollRef]
    )

    React.useLayoutEffect(() => {
      const node = nodeRef.current
      if (!node || frozenSide) return
      const placed = node.getAttribute("data-side")
      if (
        placed === "top" ||
        placed === "right" ||
        placed === "bottom" ||
        placed === "left"
      ) {
        setFrozenSide(placed)
      }
    }, [frozenSide])

    React.useLayoutEffect(() => {
      const node = nodeRef.current
      if (!node || !frozenSide) return
      const wrapper =
        (node.closest(
          "[data-radix-popper-content-wrapper]"
        ) as HTMLElement | null) ?? node

      if (!originRef.current) {
        const rect = wrapper.getBoundingClientRect()
        originRef.current = { top: rect.top, left: rect.left }
      }

      const { top, left } = originRef.current
      wrapper.style.setProperty("position", "fixed", "important")
      wrapper.style.setProperty("top", `${top}px`, "important")
      wrapper.style.setProperty("left", `${left}px`, "important")
      wrapper.style.setProperty("right", "auto", "important")
      wrapper.style.setProperty("bottom", "auto", "important")
      wrapper.style.setProperty("transform", "none", "important")
      wrapper.style.setProperty("margin", "0", "important")
    })

    return (
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          ref={setRefs}
          align={align}
          sideOffset={sideOffset}
          sticky="always"
          className={cn(
            "z-[220] pointer-events-auto w-72 rounded-sm border bg-popover p-4 text-popover-foreground outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            className
          )}
          {...props}
          side={side ?? frozenSide ?? "bottom"}
          avoidCollisions={avoidCollisions ?? frozenSide == null}
        />
      </PopoverPrimitive.Portal>
    )
  }
)
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
