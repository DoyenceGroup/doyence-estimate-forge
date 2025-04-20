
import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <div style={{ width: 150, position: "relative" }}>
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative w-full touch-none select-none flex items-center",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-5 w-full overflow-hidden rounded-lg bg-secondary">
        <SliderPrimitive.Range className="absolute h-full bg-primary rounded-lg" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className="block h-7 w-7 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        style={{ left: '0', transform: 'translateX(0)' }}
      />
    </SliderPrimitive.Root>
  </div>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
